package kallaspriit.bot;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.AsyncTask;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.lang.ref.WeakReference;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

// https://github.com/jpetrocik/bluetoothserial/blob/master/src/org/psoft/android/bluetooth/BluetoothSerial.java
public class BluetoothSerial {
    private static String LOG_TAG = "BluetoothSerial";
    public static String BLUETOOTH_CONNECTED = "BLUETOOTH_CONNECTED";
    public static String BLUETOOTH_DISCONNECTED = "BLUETOOTH_DISCONNECTED";
    public static String BLUETOOTH_CONNECTION_FAILED = "BLUETOOTH_CONNECTION_FAILED";
    public static String BLUETOOTH_NOT_SUPPORTED = "BLUETOOTH_NOT_SUPPORTED";
    public static String BLUETOOTH_DISABLED = "BLUETOOTH_DISABLED";

    private boolean connected = false;

    private BluetoothDevice bluetoothDevice;
    private BluetoothSocket bluetoothSocket;
    private InputStream serialInputStream;
    private OutputStream serialOutputStream;
    private SerialReader serialReader;
    private MessageHandler messageHandler;
    private Context context;
    private AsyncTask<Void, Void, BluetoothDevice> attemptConnectionTask;
    private String devicePrefix;

    private static class AttemptConnectionTask extends AsyncTask<Void, Void, BluetoothDevice> {

        private static String SERIAL_PORT_SERVICE_ID = "00001101-0000-1000-8000-00805F9B34FB";
        private static int MAX_ATTEMPTS = 30;

        private WeakReference<BluetoothSerial> bluetoothSerialReference;
        private List<BluetoothDevice> pairedDevices;


        // only retain a weak reference to the bluetooth serial
        AttemptConnectionTask(BluetoothSerial bluetoothSerial, List<BluetoothDevice> pairedDevices) {
            bluetoothSerialReference = new WeakReference<>(bluetoothSerial);

            this.pairedDevices = pairedDevices;
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
                for (BluetoothDevice device : pairedDevices) {
                    // skip if the device name does not match the prefix
                    if (!device.getName().toUpperCase().startsWith(bluetoothSerial.devicePrefix)) {
                        continue;
                    }

                    attemptCount++;

                    Log.i(LOG_TAG, ": attempting to connect to: " + device.getName() + " (attempt #" + attemptCount + ")");

                    try {
                        // attempt to create socket
                        try {
                            UUID uuid = UUID.fromString(SERIAL_PORT_SERVICE_ID);

                            // attempt to create socket using uuid
                            bluetoothSerial.bluetoothSocket = device.createRfcommSocketToServiceRecord(uuid);
                        } catch (Exception ce) {
                            // normal connection failed, attempt to connect via reflection
                            bluetoothSerial.bluetoothSocket = bluetoothSerial.connectViaReflection(device);
                        }

                        // connect to the socket
                        bluetoothSerial.bluetoothSocket.connect();

                        // setup the streams
                        bluetoothSerial.serialInputStream = bluetoothSerial.bluetoothSocket.getInputStream();
                        bluetoothSerial.serialOutputStream = bluetoothSerial.bluetoothSocket.getOutputStream();

                        // we're now connected
                        bluetoothSerial.connected = true;

                        Log.i(LOG_TAG, "connected to device '" + device.getName() + "'");

                        return device;
                    } catch (Exception e) {
                        bluetoothSerial.bluetoothSocket = null;
                        bluetoothSerial.serialInputStream = null;
                        bluetoothSerial.serialOutputStream = null;

                        Log.i(LOG_TAG, "connecting failed: " + e.getMessage());
                    }
                }

                // cancel if maximum attempt count is reached
                if (attemptCount >= MAX_ATTEMPTS) {
                    Log.i(LOG_TAG, "maximum connection attempt of " + MAX_ATTEMPTS + " exceeded, giving up");

                    this.cancel(false);
                } else {
                    try {
                        Thread.sleep(1000);
                    } catch (InterruptedException e) {
                        break;
                    }
                }
            }

            Log.i(LOG_TAG, "connecting to bluetooth failed");

            LocalBroadcastManager.getInstance(bluetoothSerial.context).sendBroadcast(new Intent(BLUETOOTH_CONNECTION_FAILED));

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

            // start thread responsible for reading from the input stream
            bluetoothSerial.serialReader = new SerialReader(bluetoothSerial);
            bluetoothSerial.serialReader.start();

            // send connection message
            LocalBroadcastManager.getInstance(bluetoothSerial.context).sendBroadcast(new Intent(BLUETOOTH_CONNECTED));
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
            Log.i(LOG_TAG, "starting serial reader");

            while (!isInterrupted()) {
                try {
                    // read bytes if available
                    if (bluetoothSerial.available() > 0) {
                        int newBytes = bluetoothSerial.read(buffer, bufferSize, MAX_BYTES - bufferSize);

                        if (newBytes > 0) {
                            bufferSize += newBytes;
                        }

                        Log.d(LOG_TAG, "read " + newBytes + " new bytes");
                    }

                    // notify the message handler if any bytes were read
                    if (bufferSize > 0) {
                        int read = bluetoothSerial.messageHandler.read(bufferSize, buffer);

                        // shift unread data to start of buffer
                        if (read > 0) {
                            int index = 0;

                            for (int i = read; i < bufferSize; i++) {
                                buffer[index++] = buffer[i];
                            }

                            bufferSize = index;
                        }
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

            Log.i(LOG_TAG, "stopped serial reader");
        }
    }

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

            Log.i(LOG_TAG, "bluetooth device '" + eventDevice.getName() + "' disconnected");

            // clean up any streams
            stop();

            // attempt to re-establish connection
            connect();

            // send notification
            LocalBroadcastManager.getInstance(context).sendBroadcast(new Intent(BLUETOOTH_DISCONNECTED));
        }
    };

    BluetoothSerial(Context context, MessageHandler messageHandler, String devicePrefix) {
        this.context = context;
        this.messageHandler = messageHandler;
        this.devicePrefix = devicePrefix.toUpperCase();
    }

    public void connect() {
        // return if already connected
        if (connected) {
            Log.w(LOG_TAG, "connect requested but bluetooth is already connected");

            LocalBroadcastManager.getInstance(context).sendBroadcast(new Intent(BLUETOOTH_CONNECTED));

            return;
        }

        // listen for bluetooth disconnect
        context.registerReceiver(bluetoothReceiver, new IntentFilter(BluetoothDevice.ACTION_ACL_DISCONNECTED));

        // return if already trying to connect
        if (attemptConnectionTask != null && attemptConnectionTask.getStatus() == AsyncTask.Status.RUNNING) {
            Log.w(LOG_TAG, "connect requested but connecting is already in progress");

            return;
        }

        // get the default bluetooth adapter
        BluetoothAdapter bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();

        // return if bluetooth is not available
        if (bluetoothAdapter == null) {
            Log.w(LOG_TAG, "connect requested but device does not have bluetooth");

            LocalBroadcastManager.getInstance(context).sendBroadcast(new Intent(BLUETOOTH_NOT_SUPPORTED));

            return;
        }

        // return if bluetooth is not enabled
        if (!bluetoothAdapter.isEnabled()) {
            Log.w(LOG_TAG, "connect requested but bluetooth is not enabled");

            // send notification
            LocalBroadcastManager.getInstance(context).sendBroadcast(new Intent(BLUETOOTH_DISABLED));

            return;
        }

        // get list of paired devices
        final List<BluetoothDevice> pairedDevices = new ArrayList<>(bluetoothAdapter.getBondedDevices());

        // return if we have no paired devices
        if (pairedDevices.size() == 0) {
            return;
        }

        // cancel discovery
        bluetoothAdapter.cancelDiscovery();

        // attempt connection in an async task
        attemptConnectionTask = new AttemptConnectionTask(this, pairedDevices);
        attemptConnectionTask.execute();
    }

    public void stop() {
        // do nothing if not connected
        if (!connected) {
            return;
        }

        Log.i(LOG_TAG, "stopping bluetooth serial");

        connected = false;

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
        try {
            serialInputStream.close();
        } catch (Exception e) {
            Log.e(LOG_TAG, "failed to release input stream connection");
        }

        // close the output stream
        try {
            serialOutputStream.close();
        } catch (Exception e) {
            Log.e(LOG_TAG, "failed to release output stream");
        }

        // close the bluetooth socket
        try {
            bluetoothSocket.close();
        } catch (Exception e) {
            Log.e(LOG_TAG, "failed to close the bluetooth socket");
        }
    }

    // see: http://stackoverflow.com/questions/3397071/service-discovery-failed-exception-using-bluetooth-on-android
    private BluetoothSocket connectViaReflection(BluetoothDevice device) throws Exception {
        @SuppressWarnings("JavaReflectionMemberAccess") Method m = device.getClass().getMethod("createRfcommSocket", int.class);

        return (BluetoothSocket) m.invoke(device, 1);
    }

    public int available() throws IOException {
        if (!connected) {
            throw new RuntimeException("bluetooth connection lost");
        }

        return serialInputStream.available();
    }

    public int read(byte[] buffer, int byteOffset, int byteCount) throws IOException {
        if (!connected) {
            throw new RuntimeException("bluetooth connection lost");
        }

        return serialInputStream.read(buffer, byteOffset, byteCount);
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

    // handles bluetooth serial messages
    public interface MessageHandler {
        int read(int bufferSize, byte[] buffer);
    }

}