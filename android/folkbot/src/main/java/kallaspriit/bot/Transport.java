package kallaspriit.bot;

public interface Transport {

  String getName();

  void send(String message);

  void addListener(Listener listener);

  enum State {
    DISCONNECTED,
    CONNECTING,
    CONNECTED
  }

  @SuppressWarnings("unused")
  interface Listener {

    default void onStateChanged(Transport transport, State newState, State previousState) {
    }

    default void onClientConnected(Transport transport) {
    }

    default void onError(Transport transport, Exception error) {
    }

    default void onMessageSent(Transport transport, String message) {
    }

    void onMessageReceived(Transport transport, String message);
  }
}
