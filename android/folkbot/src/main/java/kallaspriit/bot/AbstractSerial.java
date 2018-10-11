package kallaspriit.bot;

import android.content.Context;

import java.io.IOException;

abstract class AbstractSerial {

  protected Context context;
  protected SerialEventListener listener;
  private String name;
  private State state = State.DISCONNECTED;

  public AbstractSerial(String name, Context context, SerialEventListener listener) {
    this.name = name;
    this.context = context;
    this.listener = listener;
  }

  public String getName() {
    return name;
  }

  public State getState() {
    return state;
  }

  protected void setState(State newState) {
    if (newState == state) {
      return;
    }

    State oldState = state;

    state = newState;

    listener.onSerialStateChanged(name, newState, oldState);
  }

  public boolean isConnected() {
    return state == State.CONNECTED;
  }

  abstract public void open();

  abstract public void close();

  abstract public void sendMessage(String message) throws IOException;

  public enum State {
    CONNECTING,
    CONNECTED,
    DISCONNECTED,
    NOT_SUPPORTED,
    DEVICE_NOT_FOUND,
    DISABLED
  }

  public interface SerialEventListener {
    void onSerialMessage(String name, String message);

    void onSerialStateChanged(String name, State newState, State oldState);
  }
}
