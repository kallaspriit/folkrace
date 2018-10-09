package kallaspriit.bot;

import android.content.Context;

public class UsbSerial {
    public interface Listener {
        void onUsbSerialMessage(String message);
    }

    public enum State {
        CONNECTING,
        CONNECTED,
        DISCONNECTED,
        NOT_SUPPORTED,
        DEVICE_NOT_FOUND,
        DISABLED
    }

    private Listener listener;
    private State state = State.DISCONNECTED;

    UsbSerial(Context context, Listener listener) {
        this.listener = listener;
    }

    public State getState() {
        return state;
    }

    public boolean isConnected() {
        return state == State.CONNECTED;
    }

    public void connect() {

    }

    public void disconnect() {

    }
}
