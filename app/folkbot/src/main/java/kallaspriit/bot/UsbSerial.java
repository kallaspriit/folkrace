package kallaspriit.bot;

import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.ServiceConnection;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Message;
import android.widget.Toast;

import java.util.Set;

public class UsbSerial extends AbstractSerial {
  private static final String NAME = "USB";

  private final BroadcastReceiver broadcastReceiver = new BroadcastReceiver() {
    @Override
    public void onReceive(Context context, Intent intent) {
      String action = intent.getAction();

      if (action == null) {
        return;
      }

      switch (action) {
        case UsbService.ACTION_USB_PERMISSION_GRANTED:
          Toast.makeText(context, "USB permission granted", Toast.LENGTH_SHORT).show();

          setState(State.CONNECTED);
          break;
        case UsbService.ACTION_USB_PERMISSION_NOT_GRANTED:
          Toast.makeText(context, "USB permission not granted", Toast.LENGTH_SHORT).show();

          setState(State.DISABLED);
          break;
        case UsbService.ACTION_NO_USB:
          Toast.makeText(context, "USB not connected", Toast.LENGTH_SHORT).show();

          setState(State.DEVICE_NOT_FOUND);
          break;
        case UsbService.ACTION_USB_DISCONNECTED:
          Toast.makeText(context, "USB disconnected", Toast.LENGTH_SHORT).show();

          setState(State.DISCONNECTED);
          break;
        case UsbService.ACTION_USB_NOT_SUPPORTED:
          Toast.makeText(context, "USB device not supported", Toast.LENGTH_SHORT).show();

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
    setState(State.CONNECTING);

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
    if (!UsbService.SERVICE_CONNECTED) {
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

    filter.addAction(UsbService.ACTION_USB_PERMISSION_GRANTED);
    filter.addAction(UsbService.ACTION_NO_USB);
    filter.addAction(UsbService.ACTION_USB_DISCONNECTED);
    filter.addAction(UsbService.ACTION_USB_NOT_SUPPORTED);
    filter.addAction(UsbService.ACTION_USB_PERMISSION_NOT_GRANTED);

    context.registerReceiver(broadcastReceiver, filter);
  }

  private static class UsbSerialHandler extends Handler {
    private final Context context;
    private final SerialEventListener listener;

    UsbSerialHandler(Context context, SerialEventListener listener) {
      this.context = context;
      this.listener = listener;
    }

    @Override
    public void handleMessage(Message msg) {
      switch (msg.what) {
        case UsbService.MESSAGE_FROM_SERIAL_PORT:
          String message = (String) msg.obj;
          Toast.makeText(this.context, "SERIAL MESSAGE:" + message, Toast.LENGTH_LONG).show();

          listener.onSerialMessage(NAME, message);
          break;

        case UsbService.CTS_CHANGE:
          Toast.makeText(this.context, "CTS_CHANGE", Toast.LENGTH_SHORT).show();
          break;

        case UsbService.DSR_CHANGE:
          Toast.makeText(this.context, "DSR_CHANGE", Toast.LENGTH_SHORT).show();
          break;
      }
    }
  }
}