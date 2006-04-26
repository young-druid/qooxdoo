/* ************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2004-2006 by Schlund + Partner AG, Germany
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.oss.schlund.de

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (aecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#package(transport)
#post(qx.io.remote.RemoteRequestQueue)
#post(qx.Const)

************************************************************************ */

/*!
  This class is used to send HTTP requests to the server.
  @param vUrl Target url to issue the request to.
  @param vMethod Determines what type of request to issue (GET or
  POST). Default is GET.
  @param vResponseType The mime type of the response. Default is text/plain.
*/
qx.OO.defineClass("qx.io.remote.RemoteRequest", qx.core.Target, 
function(vUrl, vMethod, vResponseType)
{
  qx.core.Target.call(this);

  this._requestHeaders = {};
  this._parameters = {};

  this.setUrl(vUrl);
  this.setMethod(vMethod || qx.Const.METHOD_GET);
  this.setResponseType(vResponseType || qx.Const.MIMETYPE_TEXT);

  this.setProhibitCaching(true);

  // Prototype-Style Request Headers
  this.setRequestHeader("X-Requested-With", "qooxdoo");
  this.setRequestHeader("X-Qooxdoo-Version", qx.core.DefaultSettings.version);
});






/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/
/*!
  Target url to issue the request to.
*/
qx.OO.addProperty({ name : "url", type : qx.Const.TYPEOF_STRING });
/*!
  Determines what type of request to issue (GET or POST).
*/
qx.OO.addProperty(
{
  name           : "method",
  type           : qx.Const.TYPEOF_STRING,
  possibleValues : [
                   qx.Const.METHOD_GET, qx.Const.METHOD_POST,
                   qx.Const.METHOD_PUT, qx.Const.METHOD_HEAD,
                   qx.Const.METHOD_DELETE
                   ]
});
/*!
  Set the request to asynchronous.
*/
qx.OO.addProperty({ name : "asynchronous", type : qx.Const.TYPEOF_BOOLEAN, defaultValue : true });
/*!
  Set the data to be sent via this request
*/
qx.OO.addProperty({ name : "data", type : qx.Const.TYPEOF_STRING });
/*!
  Username to use for HTTP authentication. Null if HTTP authentication
  is not used.
*/
qx.OO.addProperty({ name : "username", type : qx.Const.TYPEOF_STRING });
/*!
  Password to use for HTTP authentication. Null if HTTP authentication
  is not used.
*/
qx.OO.addProperty({ name : "password", type : qx.Const.TYPEOF_STRING });
qx.OO.addProperty(
{
  name           : "state",
  type           : qx.Const.TYPEOF_STRING,
  possibleValues : [
                   qx.Const.REQUEST_STATE_CONFIGURED, qx.Const.REQUEST_STATE_QUEUED,
                   qx.Const.REQUEST_STATE_SENDING, qx.Const.REQUEST_STATE_RECEIVING,
                   qx.Const.REQUEST_STATE_COMPLETED, qx.Const.REQUEST_STATE_ABORTED,
                   qx.Const.REQUEST_STATE_TIMEOUT, qx.Const.REQUEST_STATE_FAILED
                   ],
  defaultValue   : qx.Const.REQUEST_STATE_CONFIGURED
});
/*
  Response type of request.

  The response type is a MIME type, default is text/plain. Other
  supported MIME types are text/javascript, text/html, text/json,
  application/xml.
*/
qx.OO.addProperty({
  name           : "responseType",
  type           : qx.Const.TYPEOF_STRING,
  possibleValues : [
                   qx.Const.MIMETYPE_TEXT,
                   qx.Const.MIMETYPE_JAVASCRIPT, qx.Const.MIMETYPE_JSON,
                   qx.Const.MIMETYPE_XML, qx.Const.MIMETYPE_HTML
                   ]
});
/*!
  Number of millieseconds before the request is being timed out.

  If this property is null, the timeout for the request comes is the
  qx.io.remote.RemoteRequestQueue's property defaultTimeout.
*/
qx.OO.addProperty({ name : "timeout", type : qx.Const.TYPEOF_NUMBER });

/*!
  Prohibit request from being cached.

  Setting the value to true adds a parameter "nocache" to the request
  with a value of the current time. Setting the value to false removes
  the parameter.
*/
qx.OO.addProperty({ name : "prohibitCaching", type : qx.Const.TYPEOF_BOOLEAN });
/*!
  Indicate that the request is cross domain.

  A request is cross domain if the requests URL points to a host other
  than the local host. This switches the concrete implementation that
  is used for sending the request from qx.io.remote.XmlHttpTransport to
  qx.io.remote.IframeTransport because only the latter can handle cross domain
  requests.
*/
qx.OO.addProperty({ name : "crossDomain", type : qx.Const.TYPEOF_BOOLEAN, defaultValue : false });






/*
---------------------------------------------------------------------------
  CORE METHODS
---------------------------------------------------------------------------
*/
/*!
  Schedule this request for transport to server.

  The request is added to the singleton class qx.io.remote.RemoteRequestQueue's list of
  pending requests.
*/
qx.Proto.send = function() {
  qx.io.remote.RemoteRequestQueue.add(this);
};

/*!
  Abort sending this request.

  The request is removed from the singleton class qx.io.remote.RemoteRequestQueue's
  list of pending events. If the request haven't been scheduled this
  method is a noop.
*/
qx.Proto.abort = function() {
  qx.io.remote.RemoteRequestQueue.abort(this);
};

qx.Proto.reset = function()
{
  switch(this.getState())
  {
    case qx.Const.REQUEST_STATE_SENDING:
    case qx.Const.REQUEST_STATE_RECEIVING:
      this.error("Aborting already sent request!");
      // no break

    case qx.Const.REQUEST_STATE_QUEUED:
      this.abort();
      break;
  };
};







/*
---------------------------------------------------------------------------
  STATE ALIASES
---------------------------------------------------------------------------
*/

qx.Proto.isConfigured = function() {
  return this.getState() === qx.Const.REQUEST_STATE_CONFIGURED;
};

qx.Proto.isQueued = function() {
  return this.getState() === qx.Const.REQUEST_STATE_QUEUED;
};

qx.Proto.isSending = function() {
  return this.getState() === qx.Const.REQUEST_STATE_SENDING;
};

qx.Proto.isReceiving = function() {
  return this.getState() === qx.Const.REQUEST_STATE_RECEIVING;
};

qx.Proto.isCompleted = function() {
  return this.getState() === qx.Const.REQUEST_STATE_COMPLETED;
};

qx.Proto.isAborted = function() {
  return this.getState() === qx.Const.REQUEST_STATE_ABORTED;
};

qx.Proto.isTimeout = function() {
  return this.getState() === qx.Const.REQUEST_STATE_TIMEOUT;
};

/*!
  Return true if the request is in the failed state
  (qx.Const.REQUEST_STATE_FAILED).
*/
qx.Proto.isFailed = function() {
  return this.getState() === qx.Const.REQUEST_STATE_FAILED;
};







/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

qx.Proto._onqueued = function(e)
{
  // Modify internal state
  this.setState(qx.Const.REQUEST_STATE_QUEUED);

  // Bubbling up
  this.dispatchEvent(e);
};

qx.Proto._onsending = function(e)
{
  // Modify internal state
  this.setState(qx.Const.REQUEST_STATE_SENDING);

  // Bubbling up
  this.dispatchEvent(e);
};

qx.Proto._onreceiving = function(e)
{
  // Modify internal state
  this.setState(qx.Const.REQUEST_STATE_RECEIVING);

  // Bubbling up
  this.dispatchEvent(e);
};

qx.Proto._oncompleted = function(e)
{
  // Modify internal state
  this.setState(qx.Const.REQUEST_STATE_COMPLETED);

  // Bubbling up
  this.dispatchEvent(e);

  // Automatically dispose after event completion
  this.dispose();
};

qx.Proto._onaborted = function(e)
{
  // Modify internal state
  this.setState(qx.Const.REQUEST_STATE_ABORTED);

  // Bubbling up
  this.dispatchEvent(e);

  // Automatically dispose after event completion
  this.dispose();
};

qx.Proto._ontimeout = function(e)
{
  // Modify internal state
  this.setState(qx.Const.REQUEST_STATE_TIMEOUT);

  // Bubbling up
  this.dispatchEvent(e);

  // Automatically dispose after event completion
  this.dispose();
};

qx.Proto._onfailed = function(e)
{
  // Modify internal state
  this.setState(qx.Const.REQUEST_STATE_FAILED);

  // Bubbling up
  this.dispatchEvent(e);

  // Automatically dispose after event completion
  this.dispose();
};








/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

qx.Proto._modifyState = function(propValue, propOldValue, propData)
{
  if (qx.core.Settings.enableTransportDebug) {
    this.debug("State: " + propValue);
  };

  return true;
};

qx.Proto._modifyProhibitCaching = function(propValue, propOldValue, propData)
{
  propValue ? this.setParameter("nocache", new Date().valueOf()) : this.removeParameter("nocache");

  return true;
};

qx.Proto._modifyMethod = function(propValue, propOldValue, propData)
{
  if (propValue === qx.Const.METHOD_POST) {
    this.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  };

  return true;
};

qx.Proto._modifyResponseType = function(propValue, propOldValue, propData)
{
  this.setRequestHeader("X-Qooxdoo-Response-Type", propValue);
  return true;
};






/*
---------------------------------------------------------------------------
  REQUEST HEADER
---------------------------------------------------------------------------
*/
/*!
  Add a request header to the request.

  Example: request.setRequestHeader("Content-Type", "text/html")
*/
qx.Proto.setRequestHeader = function(vId, vValue) {
  this._requestHeaders[vId] = vValue;
};

qx.Proto.removeRequestHeader = function(vId) {
  delete this._requestHeaders[vId];
};

qx.Proto.getRequestHeader = function(vId) {
  return this._requestHeaders[vId] || null;
};

qx.Proto.getRequestHeaders = function() {
  return this._requestHeaders;
};









/*
---------------------------------------------------------------------------
  PARAMETERS
---------------------------------------------------------------------------
*/
/*!
  Add a parameter to the request.

  @param vId String identifier of the parameter to add.
  @param vValue Value of parameter.
*/
qx.Proto.setParameter = function(vId, vValue) {
  this._parameters[vId] = vValue;
};

/*!
  Remove a parameter from the request.

  @param vId String identifier of the parameter to remove.
*/
qx.Proto.removeParameter = function(vId) {
  delete this._parameters[vId];
};

/*!
  Get a parameter in the request.

  @param vId String identifier of the parameter to get.
*/
qx.Proto.getParameter = function(vId) {
  return this._parameters[vId] || null;
};

/*!
  Returns an object containg all parameters for the request.
*/
qx.Proto.getParameters = function() {
  return this._parameters;
};








/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  this._requestHeaders = null;
  this._parameters = null;

  /*
  if (qx.core.Settings.enableTransportDebug) {
    this.debug("Disposing...");
  };
  */

  return qx.core.Target.prototype.dispose.call(this);
};
