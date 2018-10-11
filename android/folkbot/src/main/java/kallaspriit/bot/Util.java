package kallaspriit.bot;

import android.util.Log;

import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.util.Enumeration;

public class Util {
  private static final String TAG = "Util";

  public static String getIpAddress() {
    try {
      for (Enumeration<NetworkInterface> en = NetworkInterface.getNetworkInterfaces(); en.hasMoreElements(); ) {
        NetworkInterface intf = en.nextElement();
        for (Enumeration<InetAddress> enumIpAddr = intf.getInetAddresses(); enumIpAddr.hasMoreElements(); ) {
          InetAddress inetAddress = enumIpAddr.nextElement();

          if (!inetAddress.isLoopbackAddress()) {
            String ip = inetAddress.getHostAddress();

            // search for ipv4 address
            if (ip.contains(".")) {
              Log.i(TAG, "resolve device ip to: " + ip);

              return ip;
            }
          }
        }
      }
    } catch (SocketException ex) {
      Log.e(TAG, ex.toString());
    }

    Log.w(TAG, "resolving device ip address failed");

    return null;
  }
}
