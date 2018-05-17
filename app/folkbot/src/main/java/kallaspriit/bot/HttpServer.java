package kallaspriit.bot;

import android.content.Context;
import android.content.res.Resources;
import android.util.Log;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import fi.iki.elonen.NanoHTTPD;

public class HttpServer extends NanoHTTPD {
    private static final String TAG = "HttpServer";

    private Context context;

    HttpServer(Context context, int port) throws IOException {
        super("0.0.0.0", port);

        this.context = context;

        start(NanoHTTPD.SOCKET_READ_TIMEOUT, false);

        Log.i(TAG,"server started on port " + port);
    }

    @Override
    public Response serve(IHTTPSession request) {
        // handle only get requests
        if (request.getMethod() != Method.GET) {
            return newFixedLengthResponse(Response.Status.METHOD_NOT_ALLOWED, NanoHTTPD.MIME_PLAINTEXT, "expecting only get requests");
        }

        String uri = request.getUri();
        int resourceId = getUriResourceId(uri);

        // handle not found
        if (resourceId == 0) {
            Log.w(TAG,"resource for requested uri '" + uri + "' could not be found");

            return newFixedLengthResponse(Response.Status.NOT_FOUND, NanoHTTPD.MIME_PLAINTEXT, "requested resource could not be found");
        }

        // read the resource contents
        String contents = getResourceContents(resourceId);

        // default to text/plain
        String mimeType = NanoHTTPD.MIME_PLAINTEXT;

        // handle few common mime types
        if (uri.contains(".html") || uri.equals("/")) {
            mimeType = NanoHTTPD.MIME_HTML;
        } else if (uri.contains(".css")) {
            mimeType = "text/css";
        }

        // send the response
        return newFixedLengthResponse(Response.Status.OK, mimeType, contents);
    }

    private String getResourceContents(int resourceId) {
        String contents = "";

        try {
            Resources resources = context.getResources();
            InputStream inputStream = resources.openRawResource(resourceId);

            BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
            String line = reader.readLine();

            while (line != null) {
                contents += line + "\n";

                line = reader.readLine();
            }
        } catch (Exception e) {
            Log.e(TAG,"reading resource file failed: " + e.getMessage());

            e.printStackTrace();
        }

        return contents;
    }

    private int getUriResourceId(String uri) {
        // handle index
        if (uri.equals("/")) {
           return R.raw.index;
        }

        // convert /main.js to "main"
        int lastDotPos = uri.lastIndexOf(".");
        String identifierName = uri.substring(1, lastDotPos > 0 ? lastDotPos : uri.length());

        // resolve identifier id
        int identifierId = context.getResources().getIdentifier(identifierName, "raw", context.getPackageName());

        // handle failure to map the uri to resource
        if (identifierId == 0) {
            Log.w(TAG, "uri '" + uri + "' could not be resolved to a resource");

            return 0;
        }

        Log.d(TAG, "resolved uri '" + uri + "' with name '" + identifierName + "' to id of: " + identifierId);

        return identifierId;
    }
}
