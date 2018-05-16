package kallaspriit.bot;

import android.app.Activity;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.webkit.WebSettings;
import android.webkit.WebView;

import org.java_websocket.drafts.Draft_6455;

import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.util.Enumeration;

public class MainActivity extends Activity {

    public WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // use main activity
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // create web-view
        webView = findViewById(R.id.webview);
        webView.loadUrl("http://kallaspriit/");

        // enable javascript
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);

        // make the webview debuggable
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }

        // add javascript interface
        webView.addJavascriptInterface(new WebAppInterface(this), "app");

        // create web-socket server
        Server server = new Server(8000, new Draft_6455());
        server.setConnectionLostTimeout( 0 );
        server.start();
    }
}
