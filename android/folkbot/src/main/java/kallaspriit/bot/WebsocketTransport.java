package kallaspriit.bot;

import android.util.Log;

import org.java_websocket.WebSocket;
import org.java_websocket.drafts.Draft;
import org.java_websocket.handshake.ClientHandshake;

import java.net.InetSocketAddress;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class WebsocketTransport extends org.java_websocket.server.WebSocketServer implements Transport {
  private static final String TAG = "WebsocketTransport";
  private List<Transport.Listener> listeners = new ArrayList<>();
  private Transport.State state = State.DISCONNECTED;

  WebsocketTransport(int port, Draft draft) {
    super(new InetSocketAddress(port), Collections.singletonList(draft));

    this.setReuseAddr(true);

    // disable batching algorithm to reduce latency
    this.setTcpNoDelay(true);

    setState(State.CONNECTING);
  }

  @Override
  public String getName() {
    return "WebSocket";
  }

  public void addListener(Transport.Listener listener) {
    this.listeners.add(listener);
  }

  @Override
  public void onOpen(WebSocket connection, ClientHandshake handshake) {
    Log.i(TAG, "client connected");

    listeners.forEach(listener -> listener.onClientConnected(this));
  }

  @Override
  public void onClose(WebSocket connection, int code, String reason, boolean remote) {
    Log.i(TAG, "client disconnected");
  }

  @Override
  public void onError(WebSocket connection, Exception error) {
    Log.w(TAG, "error: " + error.getMessage());

    error.printStackTrace();

    listeners.forEach(listener -> listener.onError(this, error));
  }

  @Override
  public void onStart() {
    Log.i(TAG, "web-socket server started");

    setState(Transport.State.CONNECTED);
  }

  @Override
  public void onMessage(WebSocket connection, String message) {
    Log.d(TAG, "got message: '" + message + "'");

    listeners.forEach(listener -> listener.onMessageReceived(this, message));
  }

  @Override
  public void send(String message) {
    this.broadcast(message);

    listeners.forEach(listener -> listener.onMessageSent(this, message));
  }

  private void setState(State newState) {
    if (newState == state) {
      return;
    }

    State previousState = state;

    state = newState;

    listeners.forEach(listener -> listener.onStateChanged(this, newState, previousState));
  }
}
