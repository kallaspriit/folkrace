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

    public WebView webView;
    Server server;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // use main activity
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Log.i(LOG_TAG, "creating main activity");

        // create web-view
        webView = findViewById(R.id.webview);
        webView.loadUrl("http://kallaspriit/");

        // enable javascript
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);

        // make the web-view debuggable
        WebView.setWebContentsDebuggingEnabled(true);

        // add javascript interface
        webView.addJavascriptInterface(new WebAppInterface(this), "app");
    }

    protected void onStart() {
        super.onStart();

        Log.i(LOG_TAG, "starting main activity and the web socket server");

        // create web-socket server
        server = new Server(8000, new Draft_6455());
        server.setConnectionLostTimeout( 0 );
        server.start();
    }

    @Override
    protected void onStop() {
        super.onStop();

        Log.i(LOG_TAG, "stopping main activity and the web socket server");

        // attempt to stop the server
        try {
            server.stop();
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }
}
