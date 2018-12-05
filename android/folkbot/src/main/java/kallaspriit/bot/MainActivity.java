package kallaspriit.bot;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.pm.ActivityInfo;
import android.graphics.Color;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;
import android.widget.Toast;

import org.java_websocket.drafts.Draft_6455;

import java.io.IOException;
import java.util.Arrays;

public class MainActivity extends Activity implements Hub.Listener {
  public static final String BLUETOOTH_DEVICE_NAME_PREFIX = "HC-06";
  private static final String TAG = "MainActivity";
  private static final int HTTP_SERVER_PORT = 8080;
  private static final int WEB_SOCKET_SERVER_PORT = 8000;

  WebView webView;
  ProgressBar progressBar;

  private UsbSerial usbSerial;
  private BluetoothSerial bluetoothSerial;
  private WebsocketTransport websocketTransport;
  private NativeTransport nativeTransport;
  private Hub hub;

  @SuppressLint("SetJavaScriptEnabled")
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    setupActivity();
    setupWebView();
    setupProgressBar();
    setupNativeTransport();
    setupWebsocketTransport();
    setupNativeInterface();
    setupSerials();
    setupHub();
    setupHttpServer();
    setupApp();
  }

  @Override
  protected void onResume() {
    super.onResume();

    Log.i(TAG, "resuming main activity");
  }

  @Override
  protected void onPause() {
    super.onPause();

    Log.i(TAG, "pausing main activity");
  }

  @Override
  public void onInternalCommand(String command) {
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

      case "ping":
        hub.send("pong");
        break;

      default:
        Log.w(TAG, "received unsupported internal command: '" + command + "'");
    }

    Log.i(TAG, "handling internal command: '" + command + "'");
  }

  private void setupActivity() {
    // use the main activity layout
    setContentView(R.layout.activity_main);

    // keep the screen on
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

    // force portrait orientation
    setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
  }

  @SuppressLint("SetJavaScriptEnabled")
  private void setupWebView() {
    // create webview
    webView = findViewById(R.id.webview);

    // enable javascript and storage
    WebSettings webSettings = webView.getSettings();
    webSettings.setJavaScriptEnabled(true);
    webSettings.setDomStorageEnabled(true);
    // make the web-view debuggable
    WebView.setWebContentsDebuggingEnabled(true);

    // set background color to match the application
    webView.setBackgroundColor(Color.parseColor("#282828"));
  }

  private void setupProgressBar() {
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

  private void setupNativeTransport() {
    nativeTransport = new NativeTransport(webView);
  }

  private void setupWebsocketTransport() {
    websocketTransport = new WebsocketTransport(WEB_SOCKET_SERVER_PORT, new Draft_6455());
    websocketTransport.setConnectionLostTimeout(1000);

    // open the web-socket server
    try {
      websocketTransport.start();
    } catch (Exception e) {
      Log.e(TAG, "starting web-socket server failed");

      e.printStackTrace();
    }
  }

  private void setupNativeInterface() {
    webView.addJavascriptInterface(nativeTransport, "native");
  }

  private void setupSerials() {
    usbSerial = new UsbSerial(this);
    bluetoothSerial = new BluetoothSerial(this, BLUETOOTH_DEVICE_NAME_PREFIX);
  }

  private void setupHub() {
    // hub routes data between the serials and transports
    hub = new Hub(this);

    // listen for hub events
    hub.addListener(this);

    // register available serials
    hub.addSerial(usbSerial);
    hub.addSerial(bluetoothSerial);

    // register available transports
    hub.addTransport(nativeTransport);
    hub.addTransport(websocketTransport);

    // attempt to open connections
    hub.open();
  }

  private void setupHttpServer() {
    try {
      new HttpServer(this, HTTP_SERVER_PORT);
    } catch (IOException e) {
      Log.e(TAG, "starting http server failed");

      e.printStackTrace();
    }
  }

  private void setupApp() {
    // show the local index view if not already loaded
    webView.loadUrl("http://127.0.0.1:" + HTTP_SERVER_PORT + "/");
  }

  private void handleShowToast(String[] parameters) {
    if (parameters.length != 1) {
      Log.w(TAG, "showing toast requested, expected exactly one parameter but got " + parameters.length);

      return;
    }

    String toast = parameters[0];
    Toast.makeText(this, toast, Toast.LENGTH_LONG).show();
  }
}
