package kallaspriit.bot;

import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.ServiceConnection;
import android.hardware.usb.UsbDevice;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Message;
import android.util.Log;
import android.widget.Toast;

import java.util.Set;

public class UsbSerial extends AbstractSerial {
  private static final String TAG = "UsbSerial";
  private static final String NAME = "usb";

  private final BroadcastReceiver broadcastReceiver = new BroadcastReceiver() {
    @Override
    public void onReceive(Context context, Intent intent) {
      String action = intent.getAction();

      if (action == null) {
        Log.w(TAG, "received broadcast with empty action");

        return;
      }

      switch (action) {
        case UsbService.ACTION_USB_READY:
          setState(State.CONNECTED);
          break;

        case UsbService.ACTION_USB_PERMISSION_GRANTED:
          setState(State.CONNECTING);
          break;

        case UsbService.ACTION_USB_PERMISSION_NOT_GRANTED:
          setState(State.DISABLED);
          break;

        case UsbService.ACTION_NO_USB:
          setState(State.DEVICE_NOT_FOUND);
          break;

        case UsbService.ACTION_USB_DISCONNECTED:
          setState(State.DISCONNECTED);
          break;

        case UsbService.ACTION_USB_NOT_SUPPORTED:
          setState(State.NOT_SUPPORTED);
          break;

        case UsbService.ACTION_CDC_DRIVER_NOT_WORKING:
          setState(State.NOT_SUPPORTED);
          break;

        case UsbService.ACTION_USB_DEVICE_NOT_WORKING:
          setState(State.NOT_SUPPORTED);
          break;
      }
    }
  };


  private UsbService service;
  private UsbSerialHandler handler;

  private final ServiceConnection serviceConnection = new ServiceConnection() {
    @Override
    public void onServiceConnected(ComponentName arg0, IBinder arg1) {
      service = ((UsbService.UsbBinder) arg1).getService();
      service.setHandler(handler);
    }

    @Override
    public void onServiceDisconnected(ComponentName arg0) {
      service = null;

      setState(State.DISABLED);
    }
  };

  UsbSerial(Context context, SerialEventListener listener) {
    super(NAME, context, listener);
  }

  @Override
  public void open() {
    handler = new UsbSerialHandler(context, listener);

    registerBroadcastReceiver();
    startService(UsbService.class, serviceConnection, null);
  }

  @Override
  public void close() {
    context.unregisterReceiver(broadcastReceiver);
    context.unbindService(serviceConnection);

    setState(State.DISABLED);
  }

  @Override
  public void sendMessage(String message) {
    if (service == null) {
      return;
    }

    service.write(message.getBytes());
  }

  @SuppressWarnings("SameParameterValue")
  private void startService(Class<?> service, ServiceConnection serviceConnection, Bundle extras) {
    if (!UsbService.isServiceConnected) {
      Intent startService = new Intent(context, service);

      if (extras != null && !extras.isEmpty()) {
        Set<String> keys = extras.keySet();

        for (String key : keys) {
          String extra = extras.getString(key);
          startService.putExtra(key, extra);
        }
      }

      context.startService(startService);
    }

    Intent bindingIntent = new Intent(context, service);

    context.bindService(bindingIntent, serviceConnection, Context.BIND_AUTO_CREATE);
  }

  private void registerBroadcastReceiver() {
    IntentFilter filter = new IntentFilter();

    filter.addAction(UsbService.ACTION_USB_READY);
    filter.addAction(UsbService.ACTION_USB_PERMISSION_GRANTED);
    filter.addAction(UsbService.ACTION_USB_PERMISSION_NOT_GRANTED);
    filter.addAction(UsbService.ACTION_NO_USB);
    filter.addAction(UsbService.ACTION_USB_DISCONNECTED);
    filter.addAction(UsbService.ACTION_USB_NOT_SUPPORTED);
    filter.addAction(UsbService.ACTION_CDC_DRIVER_NOT_WORKING);
    filter.addAction(UsbService.ACTION_USB_DEVICE_NOT_WORKING);

    context.registerReceiver(broadcastReceiver, filter);
  }

  private static class UsbSerialHandler extends Handler {
    private final Context context;
    private final SerialEventListener listener;
    private String commandBuffer = "";

    UsbSerialHandler(Context context, SerialEventListener listener) {
      this.context = context;
      this.listener = listener;
    }

    @Override
    public void handleMessage(Message msg) {
      switch (msg.what) {
        case UsbService.CONNECTING_TO_DEVICE:
          // get associated device
          UsbDevice device = (UsbDevice) msg.obj;

          // send usb info to listener
          listener.onSerialMessage(NAME, "usb:" + device.getVendorId() + ":" + device.getProductId() + ":" + device.getProductName());
          break;

        case UsbService.MESSAGE_FROM_SERIAL_PORT:
          // append message to buffer
          commandBuffer += (String) msg.obj;

          // handle all linefeed delimited commands
          commandBuffer = handleCommands(commandBuffer);
          break;

        case UsbService.CTS_CHANGE:
          Toast.makeText(this.context, "CTS_CHANGE", Toast.LENGTH_SHORT).show();
          break;

        case UsbService.DSR_CHANGE:
          Toast.makeText(this.context, "DSR_CHANGE", Toast.LENGTH_SHORT).show();
          break;
      }
    }

    private String handleCommands(String buffer) {
      // search for new-line
      int newLineIndex = buffer.indexOf("\n");

      // handle all commands
      while (newLineIndex != -1) {
        // extract the command
        String message = buffer.substring(0, newLineIndex);

        // remove the handled message from the message buffer
        buffer = buffer.substring(newLineIndex + 1);

        // emit the serial message event
        listener.onSerialMessage(NAME, message);

        Log.d(TAG, "got usb serial message: '" + message + "'");

        // search for next new-line
        newLineIndex = buffer.indexOf("\n");
      }

      return buffer;
    }
  }
}
