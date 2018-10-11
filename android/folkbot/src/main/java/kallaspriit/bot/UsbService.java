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

  public static final String ACTION_USB_READY = "com.felhr.connectivityservices.USB_READY";
  public static final String ACTION_USB_ATTACHED = "android.hardware.usb.action.USB_DEVICE_ATTACHED";
  public static final String ACTION_USB_DETACHED = "android.hardware.usb.action.USB_DEVICE_DETACHED";
  public static final String ACTION_USB_NOT_SUPPORTED = "com.felhr.usbservice.USB_NOT_SUPPORTED";
  public static final String ACTION_NO_USB = "com.felhr.usbservice.NO_USB";
  public static final String ACTION_USB_PERMISSION_GRANTED = "com.felhr.usbservice.USB_PERMISSION_GRANTED";
  public static final String ACTION_USB_PERMISSION_NOT_GRANTED = "com.felhr.usbservice.USB_PERMISSION_NOT_GRANTED";
  public static final String ACTION_USB_DISCONNECTED = "com.felhr.usbservice.USB_DISCONNECTED";
  public static final String ACTION_CDC_DRIVER_NOT_WORKING = "com.felhr.connectivityservices.ACTION_CDC_DRIVER_NOT_WORKING";
  public static final String ACTION_USB_DEVICE_NOT_WORKING = "com.felhr.connectivityservices.ACTION_USB_DEVICE_NOT_WORKING";
  public static final int MESSAGE_FROM_SERIAL_PORT = 0;
  public static final int CTS_CHANGE = 1;
  public static final int DSR_CHANGE = 2;
  private static final String ACTION_USB_PERMISSION = "com.android.example.USB_PERMISSION";
  private static final int BAUD_RATE = 921600; // TODO: make configurable
  public static boolean SERVICE_CONNECTED = false;

  private IBinder binder = new UsbBinder();
  private Context context;
  private Handler handler;
  private UsbManager usbManager;
  private UsbDevice device;
  private UsbDeviceConnection connection;
  private UsbSerialDevice serialPort;
  private boolean serialPortConnected;

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
          boolean granted = Objects.requireNonNull(receivedIntent.getExtras()).getBoolean(UsbManager.EXTRA_PERMISSION_GRANTED);
          if (granted) {
            // User accepted our USB connection. Try to open the device as a serial port
            Intent intent = new Intent(ACTION_USB_PERMISSION_GRANTED);
            context.sendBroadcast(intent);
            connection = usbManager.openDevice(device);
            new ConnectionThread().start();
          } else {
            // User not accepted our USB connection. Send an Intent to the Main Activity
            Intent intent = new Intent(ACTION_USB_PERMISSION_NOT_GRANTED);
            context.sendBroadcast(intent);
          }
          break;
        case ACTION_USB_ATTACHED:
          if (!serialPortConnected)
            findSerialPortDevice(); // A USB device has been attached. Try to open it as a Serial port
          break;
        case ACTION_USB_DETACHED:
          // Usb device was disconnected. send an intent to the Main Activity
          Intent intent = new Intent(ACTION_USB_DISCONNECTED);
          context.sendBroadcast(intent);
          if (serialPortConnected) {
            serialPort.close();
          }
          serialPortConnected = false;
          break;
      }
    }
  };

  private UsbSerialInterface.UsbReadCallback readCallback = new UsbSerialInterface.UsbReadCallback() {
    @Override
    public void onReceivedData(byte[] arg0) {
      try {
        String data = new String(arg0, "UTF-8");
        if (handler != null)
          handler.obtainMessage(MESSAGE_FROM_SERIAL_PORT, data).sendToTarget();
      } catch (UnsupportedEncodingException e) {
        e.printStackTrace();
      }
    }
  };

  private UsbSerialInterface.UsbCTSCallback ctsCallback = new UsbSerialInterface.UsbCTSCallback() {
    @Override
    public void onCTSChanged(boolean state) {
      if (handler != null)
        handler.obtainMessage(CTS_CHANGE).sendToTarget();
    }
  };

  private UsbSerialInterface.UsbDSRCallback dsrCallback = new UsbSerialInterface.UsbDSRCallback() {
    @Override
    public void onDSRChanged(boolean state) {
      if (handler != null)
        handler.obtainMessage(DSR_CHANGE).sendToTarget();
    }
  };


  @Override
  public void onCreate() {
    this.context = this;

    serialPortConnected = false;

    UsbService.SERVICE_CONNECTED = true;

    registerIntentFilters();

    usbManager = (UsbManager) getSystemService(Context.USB_SERVICE);

    findSerialPortDevice();
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

    UsbService.SERVICE_CONNECTED = false;
  }

  public void write(byte[] data) {
    if (serialPort != null) {
      serialPort.write(data);
    }
  }

  public void setHandler(Handler handler) {
    this.handler = handler;
  }

  private void findSerialPortDevice() {
    // attempts to open the first encountered usb device connected, excluding usb root hubs
    HashMap<String, UsbDevice> usbDevices = usbManager.getDeviceList();

    if (!usbDevices.isEmpty()) {
      boolean keepLooking = true;

      for (Map.Entry<String, UsbDevice> entry : usbDevices.entrySet()) {
        device = entry.getValue();

        int deviceVID = device.getVendorId();
        int devicePID = device.getProductId();

        if (deviceVID != 0x1d6b && (devicePID != 0x0001 && devicePID != 0x0002 && devicePID != 0x0003) && deviceVID != 0x5c6 && devicePID != 0x904c) {
          // there is a device connected to our device, yry to open it as a serial port
          requestUserPermission();
          keepLooking = false;
        } else {
          connection = null;
          device = null;
        }

        if (!keepLooking) {
          break;
        }
      }

      if (!keepLooking) {
        // there are no usb devices connected (but usb host were listed), send an intent
        Intent intent = new Intent(ACTION_NO_USB);
        sendBroadcast(intent);
      }
    } else {
      // there are no usb devices connected, send an intent
      Intent intent = new Intent(ACTION_NO_USB);
      sendBroadcast(intent);
    }
  }

  private void registerIntentFilters() {
    IntentFilter filter = new IntentFilter();

    filter.addAction(ACTION_USB_PERMISSION);
    filter.addAction(ACTION_USB_DETACHED);
    filter.addAction(ACTION_USB_ATTACHED);

    registerReceiver(broadcastReceiver, filter);
  }

  private void requestUserPermission() {
    PendingIntent pendingIntent = PendingIntent.getBroadcast(this, 0, new Intent(ACTION_USB_PERMISSION), 0);

    usbManager.requestPermission(device, pendingIntent);
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
        if (serialPort.open()) {
          serialPortConnected = true;

          serialPort.setBaudRate(BAUD_RATE);
          serialPort.setDataBits(UsbSerialInterface.DATA_BITS_8);
          serialPort.setStopBits(UsbSerialInterface.STOP_BITS_1);
          serialPort.setParity(UsbSerialInterface.PARITY_NONE);
          serialPort.setFlowControl(UsbSerialInterface.FLOW_CONTROL_OFF);
          serialPort.read(readCallback);
          serialPort.getCTS(ctsCallback);
          serialPort.getDSR(dsrCallback);

          // some arduinos would need some sleep because firmware wait some time to know
          // whether a new sketch is going to be uploaded or not
          // Thread.sleep(2000); // sleep some. YMMV with different chips.

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