var JSCapture = JSCapture || (function () {

  'use strict';

  var _isRecording = false,
      _screenWidth = screen.availWidth,
      _screenHeight = screen.availHeight,
      _initialized = false,
      _stream = null,
      _video = null,
      _canvas = null;

  navigator.getUserMedia =
    navigator.getUserMedia || navigator.webkitGetUserMedia;

  function capture(config) {
    _initialize(function () {
      if (typeof config.done === 'function') {
        _captureFrame(config)
        config.done(/*export as data URI*/);
      }
    }, config.fail);
  }

  function _captureFrame(config) {
    var context = _canvas.getContext('2d');
    context.drawImage(_video, _video.width, _video.height);
  }

  function _initialize(success, error) {
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
        _canvas = _createHiddenElement('canvas');
        _video = _createHiddenElement('video');
        _video.src = URL.createObjectURL(stream);
        success(stream);
      }, error);
    }
  }

  function _createHiddenElement(elem) {
    var el = document.createElement(elem);
    document.body.appendChild(el);
    el.style.position = 'absolute';
    el.style.top = '-9999px';
    el.style.left = '-9999px';
    return el;
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
