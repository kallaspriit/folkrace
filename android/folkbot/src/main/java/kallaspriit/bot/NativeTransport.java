package kallaspriit.bot;

import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import java.util.ArrayList;
import java.util.List;

class NativeTransport implements Transport {
  private final WebView webView;
  private List<Listener> listeners = new ArrayList<>();
  private Transport.State state = State.DISCONNECTED;

  NativeTransport(WebView webView) {
    this.webView = webView;

    setState(State.CONNECTING);

    listeners.forEach(listener -> listener.onClientConnected(this));
  }

  @Override
  public String getName() {
    return "Native";
  }

  public void send(String message) {
    webView.post(() -> webView.loadUrl("javascript:window.app.receive('" + message.replaceAll("'", "\\'") + "')"));

    listeners.forEach(listener -> listener.onMessageSent(this, message));
  }

  @Override
  public void addListener(Listener listener) {
    this.listeners.add(listener);
  }

  @JavascriptInterface
  public void receive(String message) {
    // handle handshake message
    if (message.equals("!handshake")) {
      // consider successfully connected
      setState(State.CONNECTED);

      // respond with handshake
      send("!handshake");
    }

    listeners.forEach(listener -> listener.onMessageReceived(this, message));
  }

  @SuppressWarnings("SameParameterValue")
  private void setState(State newState) {
    if (newState == state) {
      return;
    }

    State previousState = state;

    state = newState;

    listeners.forEach(listener -> listener.onStateChanged(this, newState, previousState));
  }
}
