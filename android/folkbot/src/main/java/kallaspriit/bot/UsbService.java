package kallaspriit.bot;

import android.app.PendingIntent;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbDeviceConnection;
import android.hardware.usb.UsbManager;
import android.os.Binder;
import android.os.Handler;
import android.os.IBinder;

import com.felhr.usbserial.CDCSerialDevice;
import com.felhr.usbserial.UsbSerialDevice;
import com.felhr.usbserial.UsbSerialInterface;

import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class UsbService extends Service {

  // system events
  public static final String ACTION_USB_ATTACHED = "android.hardware.usb.action.USB_DEVICE_ATTACHED";
  public static final String ACTION_USB_DETACHED = "android.hardware.usb.action.USB_DEVICE_DETACHED";

  // custom events
  public static final String ACTION_USB_READY = "kallaspriit.bot.usbservice.USB_READY";
  public static final String ACTION_USB_PERMISSION_GRANTED = "kallaspriit.bot.usbservice.USB_PERMISSION_GRANTED";
  public static final String ACTION_USB_PERMISSION_NOT_GRANTED = "kallaspriit.bot.usbservice.USB_PERMISSION_NOT_GRANTED";
  public static final String ACTION_NO_USB = "kallaspriit.bot.usbservice.NO_USB";
  public static final String ACTION_USB_DISCONNECTED = "kallaspriit.bot.usbservice.USB_DISCONNECTED";
  public static final String ACTION_USB_NOT_SUPPORTED = "kallaspriit.bot.usbservice.USB_NOT_SUPPORTED";
  public static final String ACTION_CDC_DRIVER_NOT_WORKING = "kallaspriit.bot.usbservice.ACTION_CDC_DRIVER_NOT_WORKING";
  public static final String ACTION_USB_DEVICE_NOT_WORKING = "kallaspriit.bot.usbservice.ACTION_USB_DEVICE_NOT_WORKING";

  // handler events
  public static final int MESSAGE_FROM_SERIAL_PORT = 0;
  public static final int CTS_CHANGE = 1;
  public static final int DSR_CHANGE = 2;
  public static final int CONNECTING_TO_DEVICE = 3;

  // usb permission pending intent name
  private static final String ACTION_USB_PERMISSION = "kallaspriit.bot.usbservice.USB_PERMISSION";

  // usb baud rate to use
  private static final int BAUD_RATE = 921600; // TODO: make configurable

  // track globally whether the service is connected
  public static boolean isServiceConnected = false;

  private IBinder binder = new UsbBinder();
  private Context context = null;
  private Handler handler = null;
  private UsbManager usbManager = null;
  private UsbDevice device = null;
  private UsbDeviceConnection connection = null;
  private UsbSerialDevice serialPort = null;

  private final BroadcastReceiver broadcastReceiver = new BroadcastReceiver() {
    @Override
    public void onReceive(Context context, Intent receivedIntent) {
      String action = receivedIntent.getAction();

      // ignore if no action is available
      if (action == null) {
        return;
      }

      switch (action) {
        case ACTION_USB_PERMISSION:
          boolean isPermissionGranted = Objects.requireNonNull(receivedIntent.getExtras()).getBoolean(UsbManager.EXTRA_PERMISSION_GRANTED);

          if (isPermissionGranted) {
            // user granted permission to use the device, broadcast notification
            Intent intent = new Intent(ACTION_USB_PERMISSION_GRANTED);
            context.sendBroadcast(intent);

            // try to open the device
            connection = usbManager.openDevice(device);

            // start the connection thread
            new ConnectionThread().start();
          } else {
            // user denied the permission request, broadcast notification
            Intent intent = new Intent(ACTION_USB_PERMISSION_NOT_GRANTED);
            context.sendBroadcast(intent);
          }
          break;

        case ACTION_USB_ATTACHED:
          // attempt to find a serial port to open if not already connected
          if (!isConnected()) {
            attemptConnectToSerial();
          }

          break;

        case ACTION_USB_DETACHED:
          // usb device was disconnected, broadcast notification
          Intent intent = new Intent(ACTION_USB_DISCONNECTED);
          context.sendBroadcast(intent);

          // close connection if currently open
          if (isConnected()) {
            serialPort.close();
            serialPort = null;
            device = null;
            connection = null;
          }
          break;
      }
    }
  };

  private UsbSerialInterface.UsbReadCallback readCallback = bytes -> {
    try {
      // convert to utf-8 string
      String data = new String(bytes, "UTF-8");

      // notify the handler if available
      if (handler != null) {
        handler.obtainMessage(MESSAGE_FROM_SERIAL_PORT, data).sendToTarget();
      }
    } catch (UnsupportedEncodingException e) {
      e.printStackTrace();
    }
  };

  private UsbSerialInterface.UsbCTSCallback ctsCallback = state -> {
    // notify the handler if available
    if (handler != null) {
      handler.obtainMessage(CTS_CHANGE).sendToTarget();
    }
  };

  private UsbSerialInterface.UsbDSRCallback dsrCallback = state -> {
    // notify the handler if available
    if (handler != null) {
      handler.obtainMessage(DSR_CHANGE).sendToTarget();
    }
  };


  @Override
  public void onCreate() {
    this.context = this;

    // service is now connected
    UsbService.isServiceConnected = true;

    // get the usb manager
    usbManager = (UsbManager) getSystemService(Context.USB_SERVICE);

    // setup broadcast receiver
    setupIntentFilters();

    // attempt to find and connect to a serial port
    attemptConnectToSerial();
  }

  @Override
  public IBinder onBind(Intent intent) {
    return binder;
  }

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    return Service.START_NOT_STICKY;
  }

  @Override
  public void onDestroy() {
    super.onDestroy();

    // service is not disconnected
    UsbService.isServiceConnected = false;
  }

  public boolean isConnected() {
    return serialPort != null;
  }

  public void write(byte[] data) {
    // ignore write requests if serial port is not open
    if (!isConnected()) {
      return;
    }

    serialPort.write(data);
  }

  public void setHandler(Handler handler) {
    this.handler = handler;
  }

  private void attemptConnectToSerial() {
    // get lis of connected devices
    HashMap<String, UsbDevice> usbDevices = usbManager.getDeviceList();

    // loop over the devices
    for (Map.Entry<String, UsbDevice> entry : usbDevices.entrySet()) {
      device = entry.getValue();

      // get device vendor and product ids
      int deviceVID = device.getVendorId();
      int devicePID = device.getProductId();

      // skip root hubs etc
      if (deviceVID == 0x1d6b || (devicePID == 0x0001 || devicePID == 0x0002 || devicePID == 0x0003) || deviceVID == 0x5c6 || devicePID == 0x904c) {
        continue;
      }

      // check for existing permission to access the device
      if (usbManager.hasPermission(device)) {
        // permission already available
        Intent intent = new Intent(ACTION_USB_PERMISSION_GRANTED);
        context.sendBroadcast(intent);

        // open the device
        connection = usbManager.openDevice(device);

        // start the connection thread
        new ConnectionThread().start();
      } else {
        // no existing permission, ask for it
        PendingIntent pendingIntent = PendingIntent.getBroadcast(this, 0, new Intent(ACTION_USB_PERMISSION), 0);

        usbManager.requestPermission(device, pendingIntent);
      }

      return;
    }

    // no usb device to connect to was found
    Intent intent = new Intent(ACTION_NO_USB);
    sendBroadcast(intent);
  }

  private void setupIntentFilters() {
    IntentFilter filter = new IntentFilter();

    filter.addAction(ACTION_USB_PERMISSION);
    filter.addAction(ACTION_USB_DETACHED);
    filter.addAction(ACTION_USB_ATTACHED);

    registerReceiver(broadcastReceiver, filter);
  }

  class UsbBinder extends Binder {
    @SuppressWarnings("unused")
    UsbService getService() {
      return UsbService.this;
    }
  }

  private class ConnectionThread extends Thread {
    @Override
    public void run() {
      serialPort = UsbSerialDevice.createUsbSerialDevice(device, connection);

      if (serialPort != null) {
        if (handler != null) {
          // notify handler
          handler.obtainMessage(CONNECTING_TO_DEVICE, device).sendToTarget();
        }

        // attempt to open the serial port
        if (serialPort.open()) {
          // configure serial port
          serialPort.setBaudRate(BAUD_RATE);
          serialPort.setDataBits(UsbSerialInterface.DATA_BITS_8);
          serialPort.setStopBits(UsbSerialInterface.STOP_BITS_1);
          serialPort.setParity(UsbSerialInterface.PARITY_NONE);
          serialPort.setFlowControl(UsbSerialInterface.FLOW_CONTROL_OFF);
          serialPort.read(readCallback);
          serialPort.getCTS(ctsCallback);
          serialPort.getDSR(dsrCallback);

          // usb connected, send intent
          Intent intent = new Intent(ACTION_USB_READY);
          context.sendBroadcast(intent);
        } else {
          // serial port could not be opened
          if (serialPort instanceof CDCSerialDevice) {
            Intent intent = new Intent(ACTION_CDC_DRIVER_NOT_WORKING);
            context.sendBroadcast(intent);
          } else {
            Intent intent = new Intent(ACTION_USB_DEVICE_NOT_WORKING);
            context.sendBroadcast(intent);
          }
        }
      } else {
        // no driver for given device, even generic CDC driver could not be loaded
        Intent intent = new Intent(ACTION_USB_NOT_SUPPORTED);
        context.sendBroadcast(intent);
      }
    }
  }
}