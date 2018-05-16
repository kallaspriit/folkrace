package kallaspriit.bot;

import android.util.Log;

import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.util.Enumeration;

public class Util {
    private static final String LOG_TAG = "Util";

    public static String getIpAddress() {
        try {
            for (Enumeration<NetworkInterface> en = NetworkInterface.getNetworkInterfaces(); en.hasMoreElements();) {
                NetworkInterface intf = en.nextElement();
                for (Enumeration<InetAddress> enumIpAddr = intf.getInetAddresses(); enumIpAddr.hasMoreElements();) {
                    InetAddress inetAddress = enumIpAddr.nextElement();

                    if (!inetAddress.isLoopbackAddress()) {
                        String ip = inetAddress.getHostAddress();

                        Log.i(LOG_TAG, "consider: " + ip);

                        // search for ipv4 address
                        if (ip.contains(".")) {
                            return ip;
                        }

                        // search for something like fe80::8a70:9ed1:9107:ae91%wlan0
                        /*if (ip.contains("%")) {
                            String[] ipTokens = ip.split("%");

                            Log.i(LOG_TAG, "tokens: " + String.join(", ", ipTokens));

                            if (ipTokens.length >= 2 && ipTokens[1].contains("wlan")) {
                                return ipTokens[0];
                            }
                        }*/
                    }
                }
            }
        } catch (SocketException ex) {
            Log.e(LOG_TAG, ex.toString());
        }

        Log.w(LOG_TAG, "resolving wlan ip address failed");

        return null;
    }
}
