package kallaspriit.bot;

import android.util.Log;

import org.java_websocket.WebSocket;
import org.java_websocket.drafts.Draft;
import org.java_websocket.handshake.ClientHandshake;

import java.net.InetSocketAddress;
import java.util.Collections;

public class WebSocketServer extends org.java_websocket.server.WebSocketServer {
    private static final String TAG = "WebSocketServer";

    private int connectedClientCount = 0;
    private Listener listener = null;

    public interface Listener {
        void onOpen(WebSocket connection, ClientHandshake handshake);
        void onClose(WebSocket connection, int code, String reason, boolean remote);
        void onError(WebSocket connection, Exception e);
        void onMessage(WebSocket connection, String message);
    }

    WebSocketServer(int port, Draft draft) {
        super(new InetSocketAddress(port), Collections.singletonList(draft));

        this.setReuseAddr(true);
    }

    public void setListener(Listener listener) {
        this.listener = listener;
    }

    @Override
    public void onOpen(WebSocket connection, ClientHandshake handshake) {
        connectedClientCount++;

        Log.i(TAG, "client connected (" + connectedClientCount + " total)");

        if (listener != null) {
            listener.onOpen(connection, handshake);
        }
    }

    @Override
    public void onClose(WebSocket connection, int code, String reason, boolean remote) {
        connectedClientCount--;

        Log.i(TAG, "client disconnected (" + connectedClientCount + " total)");

        if (listener != null) {
            listener.onClose(connection, code, reason, remote);
        }
    }

    @Override
    public void onError(WebSocket connection, Exception e) {
        Log.w(TAG, "error: " + e.getMessage());

        e.printStackTrace();

        if (listener != null) {
            listener.onError(connection, e);
        }
    }

    @Override
    public void onStart() {
        Log.i(TAG, "web-socket server started on " + Util.getIpAddress() + ":" + getPort());
    }

    @Override
    public void onMessage(WebSocket connection, String message) {
        Log.d(TAG, "got message: '" + message + "'");

        if (listener != null) {
            listener.onMessage(connection, message);
        }
    }
}
