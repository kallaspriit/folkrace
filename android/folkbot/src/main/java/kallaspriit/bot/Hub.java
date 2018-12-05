package kallaspriit.bot;

import android.content.Context;
import android.support.annotation.Nullable;
import android.util.Log;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class Hub implements AbstractSerial.Listener, Transport.Listener {

  private static final String TAG = "Hub";
  private Context context;
  private List<Listener> listeners = new ArrayList<>();
  private List<AbstractSerial> serials = new ArrayList<>();
  private List<Transport> transports = new ArrayList<>();

  Hub(Context context) {
    this.context = context;
  }

  public void addListener(Listener listener) {
    this.listeners.add(listener);
  }

  void addSerial(AbstractSerial serial) {
    serial.addListener(this);

    serials.add(serial);
  }

  void addTransport(Transport transport) {
    transport.addListener(this);

    transports.add(transport);
  }

  public void open() {
    serials.forEach(AbstractSerial::open);
  }

  public void close() {
    serials.forEach(AbstractSerial::close);
  }

  public void send(String message) {
    // send the message to all transports
    transports.forEach(transport -> transport.send(message));
  }

  @Override
  public void onSerialMessage(String name, String message) {
    // forward the message to all transports
    send(message);
  }

  @Override
  public void onSerialStateChanged(String name, AbstractSerial.State newState, AbstractSerial.State previousState) {
    // send the state change info to all connections
    send("serial:" + name + ":" + newState);
  }

  @Override
  public void onStateChanged(Transport transport, Transport.State newState, Transport.State previousState) {
    Log.i(TAG, transport.getName() + " transport state changed from " + previousState + " to " + newState);
  }

  @Override
  public void onClientConnected(Transport transport) {
    // report device ip address
    send("ip:" + Util.getIpAddress(context));

    // report serial states
    serials.forEach(serial -> send("serial:" + serial.getName() + ":" + serial.getState()));
  }

  @Override
  public void onError(Transport transport, Exception error) {
    Log.e(TAG, transport.getName() + " transport got error: " + error.getMessage());
  }

  @Override
  public void onMessageSent(Transport transport, String message) {
    Log.i(TAG, transport.getName() + " sent message: " + message);
  }

  @Override
  public void onMessageReceived(Transport transport, String message) {
    // consider messages starting with ! to be special internal commands not simply forwarded
    if (message.substring(0, 1).equals("!")) {
      String command = message.substring(1);

      // handle the internal command on the main thread
      // new Handler(Looper.getMainLooper()).post(() -> listeners.forEach(listener -> listener.onInternalCommand(command)));

      listeners.forEach(listener -> listener.onInternalCommand(command));

      return;
    }

    // get connected serial
    AbstractSerial connectedSerial = getConnectedSerial();

    // give up if no connected serial connection is available
    if (connectedSerial == null) {
      Log.w(TAG, transport.getName() + " received message '" + message + "' but no connected serial is available");

      return;
    }

    // attempt to forward message to connected serial
    try {
      connectedSerial.sendMessage(message + "\n");

      Log.i(TAG, "forwarded message '" + message + "' from " + transport.getName() + " transport to " + connectedSerial.getName());
    } catch (IOException e) {
      Log.w(TAG, "forwarding message '" + message + "' from " + transport.getName() + " to " + connectedSerial.getName() + " device failed (" + e.getMessage() + ")");

      e.printStackTrace();
    }
  }

  @Nullable
  private AbstractSerial getConnectedSerial() {
    return serials.stream().filter(AbstractSerial::isConnected).findFirst().orElse(null);
  }

  public interface Listener {
    void onInternalCommand(String command);
  }
}
