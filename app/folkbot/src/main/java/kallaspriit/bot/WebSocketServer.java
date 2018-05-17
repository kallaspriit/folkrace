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

    public WebSocketServer(int port, Draft draft) {
        super(new InetSocketAddress(port), Collections.singletonList(draft));

        this.setReuseAddr(true);
    }

    @Override
    public void onOpen(WebSocket conn, ClientHandshake handshake) {
        connectedClientCount++;

        Log.i(TAG, "client connected [" + connectedClientCount + "]");
    }

    @Override
    public void onClose(WebSocket conn, int code, String reason, boolean remote) {
        connectedClientCount--;

        Log.i(TAG, "client disconnected [" + connectedClientCount + "]");
    }

    @Override
    public void onError(WebSocket conn, Exception e) {
        Log.w(TAG, "error: " + e.getMessage());

        e.printStackTrace();
    }

    @Override
    public void onStart() {
        Log.i(TAG, "server started on port " + getPort());
    }

    @Override
    public void onMessage(WebSocket conn, String message) {
        Log.i(TAG, "got message: '" + message + "'");

        // echo back the message
        conn.send("you said: '" + message + "'");
    }
}
