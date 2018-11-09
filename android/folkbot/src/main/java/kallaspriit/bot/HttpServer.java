package kallaspriit.bot;

import android.content.Context;
import android.util.Log;

import java.io.IOException;
import java.io.InputStream;

import fi.iki.elonen.NanoHTTPD;

public class HttpServer extends NanoHTTPD {
  private static final String TAG = "HttpServer";

  private Context context;

  HttpServer(Context context, int port) throws IOException {
    super("0.0.0.0", port);

    this.context = context;

    start(NanoHTTPD.SOCKET_READ_TIMEOUT, false);

    Log.i(TAG, "server started on port " + port);
  }

  @Override
  public Response serve(IHTTPSession request) {
    // handle only get requests
    if (request.getMethod() != Method.GET) {
      return newFixedLengthResponse(Response.Status.METHOD_NOT_ALLOWED, NanoHTTPD.MIME_PLAINTEXT, "expecting only get requests");
    }

    // resolve asset filename and mime type
    String filename = getAssetFilename(request.getUri());
    String mimeType = getMimeType(filename);

    // attempt to read the file
    String contents;

    try {
      contents = getAssetContents(filename);
    } catch (IOException e) {
      Log.d(TAG, "asset for requested uri '" + filename + "' could not be found");

      contents = "requested resource could not be found";
      mimeType = NanoHTTPD.MIME_PLAINTEXT;
    }

    Log.i(TAG, "sending file '" + filename + "' of mime type type '" + mimeType + "' (" + contents.length() + " bytes)");

    // send the response
    return newFixedLengthResponse(Response.Status.OK, mimeType, contents);
  }

  private String getAssetFilename(String uri) {
    // default to index file
    if (uri.equals("/")) {
      return "index.html";
    }

    // remove leading slash
    if (uri.substring(0, 1).equals("/")) {
      uri = uri.substring(1);
    }

    return uri;
  }

  private String getMimeType(String filename) {
    // default to text/plain
    String mimeType = NanoHTTPD.MIME_PLAINTEXT;

    // handle few common mime types
    if (filename.contains(".html") || filename.equals("/")) {
      mimeType = NanoHTTPD.MIME_HTML;
    } else if (filename.contains(".css")) {
      mimeType = "text/css";
    } else if (filename.contains(".svg")) {
      mimeType = "image/svg+xml";
    } else if (filename.contains(".js")) {
      mimeType = "application/javascript";
    }
    return mimeType;
  }

  private String getAssetContents(String filename) throws IOException {
    InputStream is = context.getAssets().open(filename);

    int size = is.available();
    byte[] buffer = new byte[size];

    //noinspection ResultOfMethodCallIgnored
    is.read(buffer);
    is.close();

    return new String(buffer);
  }
}