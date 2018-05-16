package kallaspriit.bot;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.webkit.WebSettings;
import android.webkit.WebView;

import org.java_websocket.drafts.Draft_6455;

import java.io.IOException;

public class MainActivity extends Activity {

    private static final String LOG_TAG = "MainActivity";
    private static final int HTTP_SERVER_PORT = 8080;
    private static final int WEB_SOCKET_SERVER_PORT = 8000;

    public WebView webView;
    WebSocketServer webSocketServer;
    HttpServer httpServer;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // use main activity
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Log.i(LOG_TAG, "creating main activity");

        // create web-view
        webView = findViewById(R.id.webview);

        // enable javascript and storage
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);

        // make the web-view debuggable
        WebView.setWebContentsDebuggingEnabled(true);

        // add javascript interface
        webView.addJavascriptInterface(new ScriptInterface(this), "app");
    }

    protected void onStart() {
        super.onStart();

        Log.i(LOG_TAG, "starting main activity");

        // create http server
        try {
            httpServer = new HttpServer(this, HTTP_SERVER_PORT);
        } catch (IOException e) {
            Log.e(LOG_TAG, "starting http server failed");

            e.printStackTrace();
        }

        // create web-socket server
        webSocketServer = new WebSocketServer(WEB_SOCKET_SERVER_PORT, new Draft_6455());
        webSocketServer.setConnectionLostTimeout(1000);
        webSocketServer.start();

        // show the local index view
        webView.loadUrl("http://127.0.0.1:" + HTTP_SERVER_PORT + "/");
    }

    @Override
    protected void onStop() {
        super.onStop();

        Log.i(LOG_TAG, "stopping main activity");

        stopHttpServer();
        stopWebSocketServer();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();

        stopHttpServer();
        stopWebSocketServer();
    }

    private void stopHttpServer() {
        // do nothing if already stopped
        if (httpServer == null) {
            return;
        }

        // stop the http server
        httpServer.stop();
        httpServer = null;

    }

    private void stopWebSocketServer() {
        // do nothing if already stopped
        if (webSocketServer == null) {
            return;
        }

        // attempt to stop the web-socket server
        try {
            webSocketServer.stop();
        } catch (IOException | InterruptedException e) {
            Log.e(LOG_TAG, "stopping web-socket server failed");

            e.printStackTrace();
        } finally {
            webSocketServer = null;
        }
    }
}
