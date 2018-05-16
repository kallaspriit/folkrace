package kallaspriit.bot;

import org.java_websocket.WebSocket;
import org.java_websocket.drafts.Draft;
import org.java_websocket.framing.Framedata;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.server.WebSocketServer;

import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.util.Collections;

public class Server extends WebSocketServer {
    private static int counter = 0;
    public Server( int port, Draft d ) {
        super( new InetSocketAddress( port ), Collections.singletonList( d ) );
    }

    public Server( InetSocketAddress address, Draft d ) {
        super( address, Collections.singletonList( d ) );
    }

    @Override
    public void onOpen(WebSocket conn, ClientHandshake handshake ) {
        counter++;
        System.out.println( "///////////Opened connection number" + counter );
    }

    @Override
    public void onClose( WebSocket conn, int code, String reason, boolean remote ) {
        System.out.println( "closed" );
    }

    @Override
    public void onError( WebSocket conn, Exception ex ) {
        System.out.println( "Error:" );
        ex.printStackTrace();
    }

    @Override
    public void onStart() {
        System.out.println( "Server started!" );
    }

    @Override
    public void onMessage( WebSocket conn, String message ) {
        conn.send( message );
    }
    @Override
    public void onFragment( WebSocket conn, Framedata fragment ) {
        System.out.println( "received fragment: " + fragment );
    }

    @Override
    public void onMessage( WebSocket conn, ByteBuffer blob ) {
        conn.send( blob );
    }

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
