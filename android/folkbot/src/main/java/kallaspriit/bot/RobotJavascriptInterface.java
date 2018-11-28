package kallaspriit.bot;

import android.content.Context;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Toast;

// TODO: use json payloads
class RobotJavascriptInterface {
  private final Context context;
  private final WebView webView;

  RobotJavascriptInterface(Context context, WebView webView) {
    this.context = context;
    this.webView = webView;
  }

  @JavascriptInterface
  public void receive(String message) {
    // TODO: handle the message properly
    Toast.makeText(context, message, Toast.LENGTH_SHORT).show();
  }

  public void send(String message) {
    webView.loadUrl("javascript:window.app.receive('" + message.replaceAll("'", "\\'") + "')");
  }
}
