package kallaspriit.bot;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class SerialProxy implements WebSocketServer.WebSocketEventListener, AbstractSerial.SerialEventListener {

  private static final String TAG = "SerialProxy";
  private Context context;
  private WebSocketServer webSocketServer;
  private SerialProxyEventListener listener;
  private List<AbstractSerial> serials = new ArrayList<>();

  SerialProxy(Context context, SerialProxyEventListener listener, WebSocketServer webSocketServer) {
    this.context = context;
    this.listener = listener;
    this.webSocketServer = webSocketServer;

    // register oneself as the web-socket server listener
    webSocketServer.setListener(this);
  }

  void addSerial(AbstractSerial serial) {
    serials.add(serial);
  }

  public void open() {
    serials.forEach(AbstractSerial::open);
  }

  public void close() {
    serials.forEach(AbstractSerial::close);
  }

  @Override
  public void onWebSocketOpen(WebSocket connection, ClientHandshake handshake) {
    // send own ip address
    connection.send("ip:" + Util.getIpAddress(context));

    // send serial states
    serials.forEach(serial -> connection.send("serial:" + serial.getName() + ":" + serial.getState()));
  }

  @Override
  public void onWebSocketMessage(WebSocket connection, String message) {
    // commands starting with hash are handled by the app and not forwarded
    if (message.substring(0, 1).equals("!")) {
      String command = message.substring(1);

      // handle the internal command on the main thread
      new Handler(Looper.getMainLooper()).post(() -> listener.onInternalCommand(command));

      return;
    }

    // proxy the message to the first connected serial
    boolean wasMessageSent = false;

    for (int i = 0; i < serials.size(); i++) {
      AbstractSerial serial = serials.get(i);

      if (serial.isConnected()) {
        try {
          serial.sendMessage(message);

          wasMessageSent = true;

          Log.i(TAG, "forwarded message '" + message + "' to " + serial.getName());

          break;
        } catch (IOException e) {
          Log.w(TAG, "forwarding message '" + message + "' to " + serial.getName() + " device failed (" + e.getMessage() + ")");

          e.printStackTrace();
        }
      }
    }

    if (!wasMessageSent) {
      Log.w(TAG, "received web-socket message '" + message + "' but no working serial connection is available");
    }
  }

  private void broadcast(String message) {
    if (webSocketServer == null) {
      Log.w(TAG, "broadcasting '" + message + "' requested but web-socket server is not connected");

      return;
    }

    if (webSocketServer.getConnections().size() == 0) {
      Log.w(TAG, "broadcasting '" + message + "' requested but no web-socket clients are connected");

      return;
    }

    // broadcast the message to all connected clients
    webSocketServer.getConnections().forEach(connection -> connection.send(message));
  }

  @Override
  public void onSerialMessage(String name, String message) {
    // broadcast the message to all web-socket connections
    broadcast(message);
  }

  @Override
  public void onSerialStateChanged(String name, AbstractSerial.State newState, AbstractSerial.State oldState) {
    // broadcast the state change info to all web-socket connections
    broadcast("serial:" + name + ":" + newState);
  }

  public interface SerialProxyEventListener {
    void onInternalCommand(String command);
  }
}
