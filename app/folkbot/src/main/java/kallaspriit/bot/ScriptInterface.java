package kallaspriit.bot;

import android.webkit.JavascriptInterface;
import android.widget.Toast;

public class ScriptInterface {
    MainActivity mainActivity;

    ScriptInterface(MainActivity activity) {
        mainActivity = activity;
    }

    @JavascriptInterface
    public void showToast(String toast) {
        Toast.makeText(mainActivity, toast, Toast.LENGTH_SHORT).show();
    }

    @JavascriptInterface
    public String getIpAddress() {
        return Util.getIpAddress();
    }


    @JavascriptInterface
    public void reload() {
        mainActivity.webView.post(() -> mainActivity.webView.reload());
    }
}
