package kallaspriit.bot;

import android.util.Log;

import org.java_websocket.WebSocket;
import org.java_websocket.drafts.Draft;
import org.java_websocket.handshake.ClientHandshake;

import java.net.InetSocketAddress;
import java.util.Collections;

public class WebSocketServer extends org.java_websocket.server.WebSocketServer {
    private static final String LOG_TAG = "WebSocketServer";

    private static int counter = 0;

    public WebSocketServer(int port, Draft d) {
        super(new InetSocketAddress(port), Collections.singletonList(d));
    }

//    public Server( InetSocketAddress address, Draft d ) {
//        super( address, Collections.singletonList( d ) );
//    }

    @Override
    public void onOpen(WebSocket conn, ClientHandshake handshake) {
        counter++;

        Log.i(LOG_TAG, "client connected [" + counter + "]");
    }

    @Override
    public void onClose(WebSocket conn, int code, String reason, boolean remote) {
        counter--;

        Log.i(LOG_TAG, "client disconnected [" + counter + "]");
    }

    @Override
    public void onError(WebSocket conn, Exception e) {
        Log.w(LOG_TAG, "error: " + e.getMessage());

        e.printStackTrace();
    }

    @Override
    public void onStart() {
        Log.i(LOG_TAG, "server started on port " + getPort());
    }

    @Override
    public void onMessage(WebSocket conn, String message) {
        Log.i(LOG_TAG, "got message: '" + message + "'");

        // echo back the message
        conn.send("you said: '" + message + "'");
    }

//    @Override
//    public void onFragment(WebSocket conn, Framedata fragment) {
//        System.out.println("received fragment: " + fragment);
//    }

//    @Override
//    public void onMessage(WebSocket conn, ByteBuffer blob) {
//        conn.send(blob);
//    }

//    public static void main( String[] args ) throws UnknownHostException {
//        WebSocketImpl.DEBUG = false;
//        int port;
//        try {
//            port = new Integer( args[0] );
//        } catch ( Exception e ) {
//            System.out.println( "No port specified. Defaulting to 9003" );
//            port = 9003;
//        }
//        AutobahnServerTest test = new AutobahnServerTest( port, new Draft_6455() );
//        test.setConnectionLostTimeout( 0 );
//        test.start();
//    }
}
