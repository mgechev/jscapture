var JSCapture = JSCapture || (function () {

  'use strict';

  var _isRecording = false,
      _screenWidth = screen.availWidth,
      _screenHeight = screen.availHeight,
      _initialized = false,
      _stream = null;

  navigator.getUserMedia =
    navigator.getUserMedia || navigator.webkitGetUserMedia;

  function capture(config) {
    _getStream(function (stream) {
      if (typeof config.done === 'function') {
        config.done(_captureFrame(config, stream));
      }
    }, config.fail);
  }

  function _captureFrame(config, stream) {
  }

  function _getStream(success, error) {
    if (_initialized) {
      success(_stream);
    } else {
      navigator.getUserMedia({
        video: {
          mandatory: {
            chromeMediaSource: 'screen',
            maxWidth: _screenWidth,
            maxHeight: _screenHeight,
            minWidth: _screenWidth,
            minHeight: _screenHeight
          }
        }
      }, function (stream) {
        _stream = stream;
        _initialized = true;
      }, error);
    }
  }

  function record(config) {
    _isRecording = true;
  }

  function stopRecording() {
    _isRecording = false;
  }

  function isRecording() {
    return _isRecording;
  }

  return {
    capture: capture,
    record: record,
    stopRecording: stopRecording,
    isRecording: isRecording
  };
}());
