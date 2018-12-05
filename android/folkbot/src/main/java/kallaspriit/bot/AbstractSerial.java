package kallaspriit.bot;

import android.content.Context;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

abstract class AbstractSerial {

  protected Context context;
  protected List<Listener> listeners = new ArrayList<>();
  private String name;
  private State state = State.DISCONNECTED;

  AbstractSerial(String name, Context context) {
    this.name = name;
    this.context = context;
  }

  public String getName() {
    return name;
  }

  public void addListener(Listener listener) {
    this.listeners.add(listener);
  }

  public State getState() {
    return state;
  }

  protected void setState(State newState) {
    if (newState == state) {
      return;
    }

    State previousState = state;

    state = newState;

    listeners.forEach(listener -> listener.onSerialStateChanged(name, newState, previousState));
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

  public interface Listener {
    void onSerialMessage(String name, String message);

    void onSerialStateChanged(String name, State newState, State previousState);
  }
}
