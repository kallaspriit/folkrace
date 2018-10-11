package kallaspriit.bot;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.AsyncTask;
import android.util.Log;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.lang.ref.WeakReference;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class BluetoothSerial extends AbstractSerial {
  private static final String TAG = "BluetoothSerial";
  private static final String NAME = "bluetooth";

  private State state = State.DISCONNECTED;
  private BluetoothDevice bluetoothDevice;
  private BluetoothSocket bluetoothSocket;
  private InputStream serialInputStream;
  private OutputStream serialOutputStream;
  private SerialReader serialReader;
  private AsyncTask<Void, Void, BluetoothDevice> attemptConnectionTask;
  private String devicePrefix;

  // listens for discount message from bluetooth system and re-establishing a connection
  private final BroadcastReceiver bluetoothReceiver = new BroadcastReceiver() {
    @Override
    public void onReceive(Context context, Intent intent) {
      // return if there is no active device
      if (bluetoothDevice == null) {
        return;
      }

      String action = intent.getAction();

      // return if the action is not disconnecting
      if (action == null || !action.equals(BluetoothDevice.ACTION_ACL_DISCONNECTED)) {
        return;
      }

      BluetoothDevice eventDevice = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);

      // return if the disconnected device is not our device
      if (!bluetoothDevice.equals(eventDevice)) {
        return;
      }

      Log.i(TAG, "bluetooth device '" + eventDevice.getName() + "' disconnected");

      // clean up any streams
      close();

      // update state
      setState(State.DISCONNECTED);

      // attempt to re-establish connection
      open();
    }
  };

  BluetoothSerial(Context context, SerialEventListener listener, String devicePrefix) {
    super(NAME, context, listener);

    this.devicePrefix = devicePrefix.toUpperCase();
  }

  public void open() {
    // return if already connected
    if (state == State.CONNECTED) {
      Log.w(TAG, "open requested but bluetooth is already connected");

      return;
    }

    // listen for bluetooth close
    context.registerReceiver(bluetoothReceiver, new IntentFilter(BluetoothDevice.ACTION_ACL_DISCONNECTED));

    // return if already trying to open
    if (attemptConnectionTask != null && attemptConnectionTask.getStatus() == AsyncTask.Status.RUNNING) {
      Log.w(TAG, "open requested but connecting is already in progress");

      return;
    }

    // get the default bluetooth adapter
    BluetoothAdapter bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();

    // return if bluetooth is not available
    if (bluetoothAdapter == null) {
      Log.w(TAG, "open requested but device does not have bluetooth");

      // update state
      setState(State.NOT_SUPPORTED);

      return;
    }

    // return if bluetooth is not enabled
    if (!bluetoothAdapter.isEnabled()) {
      Log.w(TAG, "open requested but bluetooth is not enabled");

      // update state
      setState(State.DISABLED);

      return;
    }

    // get list of paired devices
    final List<BluetoothDevice> pairedDevices = new ArrayList<>(bluetoothAdapter.getBondedDevices());

    // return if we have no paired devices
    if (pairedDevices.size() == 0) {
      return;
    }

    // find device with name matching the configured prefix
    BluetoothDevice device = pairedDevices.stream().filter(item -> item.getName().toUpperCase().startsWith(devicePrefix.toUpperCase())).findFirst().orElse(null);

    if (device == null) {
      Log.w(TAG, "there is no paired device starting with '" + devicePrefix + "'");

      setState(State.DEVICE_NOT_FOUND);

      return;
    }

    // cancel discovery
    bluetoothAdapter.cancelDiscovery();

    // attempt connection in an async task
    attemptConnectionTask = new AttemptConnectionTask(this, device);
    attemptConnectionTask.execute();
  }

  public void close() {
    // close the connection task if running
    if (attemptConnectionTask != null && !attemptConnectionTask.isCancelled()) {
      Log.i(TAG, "cancelling connection task");

      attemptConnectionTask.cancel(false);
    }

    // do nothing if not connected
    if (!isConnected()) {
      return;
    }

    Log.i(TAG, "stopping bluetooth serial");

    // unregister the bluetooth broadcast receiver
    context.unregisterReceiver(bluetoothReceiver);

    // interrupt the serial reader
    if (serialReader != null) {
      serialReader.interrupt();

      try {
        serialReader.join(1000);
      } catch (InterruptedException ie) {
        // ignore
      }
    }

    // close the input stream
    if (serialInputStream != null) {
      try {
        serialInputStream.close();
      } catch (Exception e) {
        Log.e(TAG, "failed to release input stream");
      }
    }

    // close the output stream
    if (serialOutputStream != null) {
      try {
        serialOutputStream.close();
      } catch (Exception e) {
        Log.e(TAG, "failed to release output stream");
      }
    }

    // close the bluetooth socket
    if (bluetoothSocket != null) {
      try {
        bluetoothSocket.close();
      } catch (Exception e) {
        Log.e(TAG, "failed to close the bluetooth socket");
      }
    }

    // update state
    setState(State.DISCONNECTED);
  }

  BluetoothDevice getDevice() {
    return bluetoothDevice;
  }

  // see: http://stackoverflow.com/questions/3397071/service-discovery-failed-exception-using-bluetooth-on-android
  private BluetoothSocket connectViaReflection(BluetoothDevice device) throws Exception {
    @SuppressWarnings("JavaReflectionMemberAccess") Method m = device.getClass().getMethod("createRfcommSocket", int.class);

    return (BluetoothSocket) m.invoke(device, 1);
  }

  public int available() throws IOException {
    if (!isConnected()) {
      throw new RuntimeException("checking availability requested but bluetooth is not connected");
    }

    return serialInputStream.available();
  }

  public int read(byte[] buffer, int byteOffset, int byteCount) throws IOException {
    if (!isConnected()) {
      throw new RuntimeException("reading requested but bluetooth is not connected");
    }

    return serialInputStream.read(buffer, byteOffset, byteCount);
  }

  public void sendMessage(String message) throws IOException {
    if (!isConnected()) {
      throw new RuntimeException("sending message '" + message + "' requested but bluetooth is not connected");
    }

    serialOutputStream.write(message.getBytes("UTF-8"));
  }

  private static class AttemptConnectionTask extends AsyncTask<Void, Void, BluetoothDevice> {

    private static String SERIAL_PORT_SERVICE_ID = "00001101-0000-1000-8000-00805F9B34FB";

    private WeakReference<BluetoothSerial> bluetoothSerialReference;
    private BluetoothDevice device;


    // only retain a weak reference to the bluetooth serial
    AttemptConnectionTask(BluetoothSerial bluetoothSerial, BluetoothDevice device) {
      bluetoothSerialReference = new WeakReference<>(bluetoothSerial);

      this.device = device;
    }

    @Override
    protected BluetoothDevice doInBackground(Void... params) {
      BluetoothSerial bluetoothSerial = bluetoothSerialReference.get();

      // return if serial reference is not valid any more
      if (bluetoothSerial == null) {
        return null;
      }

      int attemptCount = 0;

      while (!isCancelled()) {
        attemptCount++;

        Log.i(TAG, ": attempting to open to '" + device.getName() + "' (attempt #" + attemptCount + ")");

        // update state
        bluetoothSerial.setState(State.CONNECTING);

        try {
          // attempt to create socket
          try {
            UUID uuid = UUID.fromString(SERIAL_PORT_SERVICE_ID);

            // attempt to create socket using uuid
            bluetoothSerial.bluetoothSocket = device.createRfcommSocketToServiceRecord(uuid);
          } catch (Exception ce) {
            // normal connection failed, attempt to open via reflection
            bluetoothSerial.bluetoothSocket = bluetoothSerial.connectViaReflection(device);
          }

          // open to the socket
          bluetoothSerial.bluetoothSocket.connect();

          // setup the streams
          bluetoothSerial.serialInputStream = bluetoothSerial.bluetoothSocket.getInputStream();
          bluetoothSerial.serialOutputStream = bluetoothSerial.bluetoothSocket.getOutputStream();

          return device;
        } catch (Exception e) {
          // reset
          bluetoothSerial.bluetoothSocket = null;
          bluetoothSerial.serialInputStream = null;
          bluetoothSerial.serialOutputStream = null;

          Log.i(TAG, "connection attempt failed");
        }

        // wait a bit and try again
        try {
          Thread.sleep(1000);
        } catch (InterruptedException e) {
          break;
        }
      }

      // should not really get here
      Log.i(TAG, "connecting to bluetooth failed");

      // update state
      bluetoothSerial.setState(State.DISCONNECTED);

      return null;
    }

    @Override
    protected void onPostExecute(BluetoothDevice bluetoothDevice) {
      super.onPostExecute(bluetoothDevice);

      BluetoothSerial bluetoothSerial = bluetoothSerialReference.get();

      // return if serial reference is not valid any more
      if (bluetoothSerial == null) {
        return;
      }

      // set the connected bluetooth device
      bluetoothSerial.bluetoothDevice = bluetoothDevice;

      // open thread responsible for reading from the input stream
      bluetoothSerial.serialReader = new SerialReader(bluetoothSerial);
      bluetoothSerial.serialReader.start();

      // update state
      bluetoothSerial.setState(State.CONNECTED);

      Log.i(TAG, "connected to device '" + device.getName() + "'");
    }
  }

  private static class SerialReader extends Thread {
    private static final int MAX_BYTES = 1024;
    private static final int WAIT_DURATION_MS = 10; // TODO: reduce?

    private BluetoothSerial bluetoothSerial;
    private byte[] buffer = new byte[MAX_BYTES];
    private int bufferSize = 0;

    SerialReader(BluetoothSerial bluetoothSerial) {
      this.bluetoothSerial = bluetoothSerial;
    }

    public void run() {
      Log.i(TAG, "starting serial reader");

      while (!isInterrupted()) {
        try {
          // onBluetoothSerialMessage bytes if available
          if (bluetoothSerial.available() > 0) {
            int newBytes = bluetoothSerial.read(buffer, bufferSize, MAX_BYTES - bufferSize);

            if (newBytes > 0) {
              bufferSize += newBytes;
            }

            Log.d(TAG, "onBluetoothSerialMessage " + newBytes + " new bytes");
          }

          // notify the message handler if any bytes were onBluetoothSerialMessage
          if (bufferSize > 0) {
            String message = new String(buffer, 0, bufferSize, "UTF-8");
            bluetoothSerial.listener.onSerialMessage(NAME, message);

            bufferSize = 0;
          } else {
            // wait a bit before trying again
            try {
              Thread.sleep(WAIT_DURATION_MS);
            } catch (InterruptedException ie) {
              break;
            }
          }
        } catch (Exception e) {
          // connection closed
        }
      }

      Log.i(TAG, "stopped serial reader");
    }
  }

    /*
    public void write(byte[] buffer) throws IOException {
        if (!connected) {
            throw new RuntimeException("bluetooth connection lost");
        }

        serialOutputStream.write(buffer);
    }

    public void write(int oneByte) throws IOException {
        if (!connected) {
            throw new RuntimeException("bluetooth connection lost");
        }

        serialOutputStream.write(oneByte);
    }

    public void write(byte[] buffer, int offset, int count) throws IOException {
        if (!connected) {
            throw new RuntimeException("bluetooth connection lost");
        }

        serialOutputStream.write(buffer, offset, count);
    }
    */

}