package kallaspriit.bot;

import android.content.Context;
import android.net.wifi.WifiManager;
import android.util.Log;

import java.math.BigInteger;
import java.net.InetAddress;
import java.nio.ByteOrder;

import static android.content.Context.WIFI_SERVICE;

class Util {
  private static final String TAG = "Util";

  static String getIpAddress(Context context) {
    // get wifi manager
    WifiManager wifiManager = (WifiManager) context.getSystemService(WIFI_SERVICE);

    try {
      // return if no wifi manager is available
      if (wifiManager == null) {
        Log.w(TAG, "getting wifi manager failed");

        return null;
      }

      // get the raw ip address
      int ipAddress = wifiManager.getConnectionInfo().getIpAddress();

      // convert little-endian to big-endian if needed
      if (ByteOrder.nativeOrder().equals(ByteOrder.LITTLE_ENDIAN)) {
        ipAddress = Integer.reverseBytes(ipAddress);
      }

      // convert to byte array
      byte[] ipByteArray = BigInteger.valueOf(ipAddress).toByteArray();

      // convert to string and return it
      return InetAddress.getByAddress(ipByteArray).getHostAddress();
    } catch (Exception ex) {
      Log.e(TAG, "formatting ip address failed");

      return null;
    }
  }
}
