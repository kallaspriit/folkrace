package kallaspriit.bot;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.ActivityInfo;
import android.graphics.Color;
import android.os.Bundle;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;
import android.widget.Toast;

import org.java_websocket.drafts.Draft_6455;

import java.io.IOException;
import java.util.Arrays;

public class MainActivity extends Activity implements BluetoothWebSocketProxy.Listener {
    private static final String TAG = "MainActivity";

    private static final int HTTP_SERVER_PORT = 8080;
    private static final int WEB_SOCKET_SERVER_PORT = 8000;
    public static final String BLUETOOTH_DEVICE_NAME_PREFIX = "HC-06";

    WebView webView;
    ProgressBar progressBar;
    private WebSocketServer webSocketServer;
    private HttpServer httpServer;
    private BluetoothWebSocketProxy bluetoothWebSocketProxy;

    private BroadcastReceiver broadcastReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();

        // return if no valid action is associated
        if (action == null) {
            return;
        }

        switch (action) {
            // broadcast bluetooth state on state change
            case BluetoothSerial.BLUETOOTH_STATE_CHANGED:
                broadcast("bluetooth:" + bluetoothWebSocketProxy.bluetoothSerial.getState() + (bluetoothWebSocketProxy.bluetoothSerial.isConnected() ? ":" + bluetoothWebSocketProxy.bluetoothSerial.getDevice().getName() : ""));
                break;

            // log unhandled local broadcast intents
            default:
                Log.w(TAG, "received unhandled local intent action: " + action);

                Toast.makeText(context, action, Toast.LENGTH_SHORT).show();
        }
        }
    };

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // use main activity
        super.onCreate(savedInstanceState);

        Log.i(TAG, "creating main activity");

        // use the main activity layout
        setContentView(R.layout.activity_main);

        // keep the screen on
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        // force portrait orientation
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);

        // create web-view
        webView = findViewById(R.id.webview);

        // enable javascript and storage
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);

        // make the web-view debuggable
        WebView.setWebContentsDebuggingEnabled(true);

        // set background color to match the application
        webView.setBackgroundColor(Color.parseColor("#282828"));

        // get reference to the progress bar widget
        progressBar = findViewById(R.id.progressBar);

        // register web-view client
        webView.setWebViewClient(new WebViewClient() {

            // listen for finished loading
            @Override
            public void onPageFinished(WebView view, String url) {
                Log.i(TAG, "web-view page has finished loading");

                // hide the progress bar
                progressBar.setVisibility(View.GONE);
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();

        Log.i(TAG, "resuming main activity");

        // show the progress bar
        progressBar.setVisibility(View.VISIBLE);

        // start the services
        startBroadcastListeners();
        startHttpServer();
        startWebSocketServer();

        // start the bluetooth service
        startBluetoothWebSocketProxy();

        // show the local index view if not already loaded
        webView.loadUrl("http://127.0.0.1:" + HTTP_SERVER_PORT + "/");
    }

    @Override
    protected void onPause() {
        super.onPause();

        Log.i(TAG, "pausing main activity");

        // load blank page
        webView.loadUrl("about:blank");

        // stop the services
        stopBluetoothWebSocketProxy();
        stopWebSocketServer();
        stopHttpServer();
        stopBroadcastListeners();
    }

    @Override
    public void handleInternalCommand(String command) {
        if (command.length() == 0) {
            return;
        }

        String[] tokens = command.split(":");
        String name = tokens[0];
        String[] parameters = Arrays.copyOfRange(tokens, 1, 2);

        switch (name) {
            case "toast":
                handleShowToast(parameters);
                break;

            case "reload":
                webView.reload();
                break;
        }

        Log.i(TAG, "handling internal command: '" + command + "'");
    }

    private void startBroadcastListeners() {
        LocalBroadcastManager.getInstance(this).registerReceiver(broadcastReceiver, new IntentFilter(BluetoothSerial.BLUETOOTH_STATE_CHANGED));
    }

    private void stopBroadcastListeners() {
        LocalBroadcastManager.getInstance(this).unregisterReceiver(broadcastReceiver);
    }

    private void startHttpServer() {
        Log.i(TAG, "starting http server");

        try {
            httpServer = new HttpServer(this, HTTP_SERVER_PORT);
        } catch (IOException e) {
            Log.e(TAG, "starting http server failed");

            e.printStackTrace();
        }
    }

    private void stopHttpServer() {
        // do nothing if already stopped
        if (httpServer == null) {
            return;
        }

        Log.i(TAG, "stopping http server");

        // stop the http server
        httpServer.stop();
        httpServer = null;
    }

    private void startWebSocketServer() {
        Log.i(TAG, "starting web-socket server");

        webSocketServer = new WebSocketServer(WEB_SOCKET_SERVER_PORT, new Draft_6455());
        webSocketServer.setConnectionLostTimeout(1000);

        // start the web-socket server
        try {
            webSocketServer.start();
        } catch (Exception e) {
            Log.e(TAG, "starting web-socket server failed");

            e.printStackTrace();
        }
    }

    private void stopWebSocketServer() {
        // do nothing if already stopped
        if (webSocketServer == null) {
            return;
        }

        Log.i(TAG, "stopping web-socket server");

        // attempt to stop the web-socket server
        try {
            webSocketServer.stop();
        } catch (IOException | InterruptedException e) {
            Log.e(TAG, "stopping web-socket server failed");

            e.printStackTrace();
        } finally {
            webSocketServer = null;
        }
    }

    private void startBluetoothWebSocketProxy() {
        Log.i(TAG, "starting bluetooth web-socket proxy");

        // setup bluetooth web-socket proxy
        bluetoothWebSocketProxy = new BluetoothWebSocketProxy(this, this, webSocketServer, BLUETOOTH_DEVICE_NAME_PREFIX);

        // attempt to connect to the bluetooth device
        bluetoothWebSocketProxy.start();
    }

    private void stopBluetoothWebSocketProxy() {
        bluetoothWebSocketProxy.stop();
        bluetoothWebSocketProxy = null;
    }

    private void handleShowToast(String[] parameters) {
        if (parameters.length != 1) {
            Log.w(TAG, "showing toast requested, expected exactly one parameter but got " + parameters.length);

            return;
        }

        String toast = parameters[0];
        Toast.makeText(this, toast, Toast.LENGTH_LONG).show();
    }

    private void broadcast(String message) {
        if (webSocketServer == null) {
            Log.w(TAG, "broadcasting '" + message + "' requested but web-socket server is not connected");

            return;
        }

        if (webSocketServer.getConnections().size() == 0) {
            Log.w(TAG, "broadcasting '" + message + "' requested but no web-socket clients are connected");

            return;
        }

        // broadcast the message to all connected clients
        webSocketServer.getConnections().forEach(connection -> connection.send(message));
    }
}
