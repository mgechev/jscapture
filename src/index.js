/* global screen, navigator, setTimeout, URL, Whammy, document */

var JSCapture = JSCapture || (function () {

  'use strict';

  var _isRecording = false,
      _screenWidth = screen.availWidth,
      _screenHeight = screen.availHeight,
      _initialized = false,
      _stream = null,
      _video = null,
      _canvas = null,
      _currentConfig, _encoder;

  var _defaultConfig = {
    delay: 0,
    x: 0,
    y: 0,
    width: _screenWidth,
    height: _screenHeight,
    done: function () {},
    process: [],
    duration: Infinity,
    frameRate: 32,
    fail: function () {}
  };

  navigator.getUserMedia =
    navigator.getUserMedia || navigator.webkitGetUserMedia;

  function capture(config) {
    _setDefaults(config);
    _initialize(function () {
      if (typeof config.done === 'function') {
        setTimeout(function () {
          _captureFrame(config);
          config.done(_canvas.toDataURL());
        }, config.delay);
      }
    }, config.fail);
  }

  function _captureFrame(config) {
    var context = _canvas.getContext('2d');
    _canvas.width = config.width;
    _canvas.height = config.height;
    config.process.forEach(function (cb) {
      cb(context, _canvas);
    });
    context.drawImage(_video, -config.x, -config.y);
  }

  function _setDefaults(config) {
    var keys = Object.keys(_defaultConfig);
    keys.forEach(function (key) {
      config[key] = config[key] || _defaultConfig[key];
    });
    return config;
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
        _video.oncanplay = function () {
          success(stream);
        };
      }, error);
    }
  }

  function _createHiddenElement(elem) {
    var el = document.createElement(elem);
    document.body.appendChild(el);
    el.width = _screenWidth;
    el.height = _screenHeight;
    el.style.position = 'absolute';
    el.style.top = -_screenHeight + 'px';
    el.style.left = -_screenWidth + 'px';
    if (elem === 'video') {
      el.setAttribute('autoplay', true);
    }
    return el;
  }

  function record(config) {
    _setDefaults(config);
    _currentConfig = config;
    if (typeof Whammy === 'undefined') {
      throw new Error('Whammy is required as dependency for screen recording');
    }
    _initialize(function () {
      _encoder = new Whammy.Video(config.frameRate);
      _isRecording = true;
      setTimeout(function () {
        _record(0, 1000 / _currentConfig.frameRate);
      }, config.delay);
    }, config.fail);
  }

  function _record(current, timeout) {
    if (current >= _currentConfig.duration) {
      return stopRecording();
    }
    _captureFrame(_currentConfig);
    _encoder.add(_canvas);
    setTimeout(function () {
      _record(current + timeout, timeout);
    }, timeout);
  }

  function stopRecording() {
    if (_isRecording) {
      var result = _encoder.compile();
      _isRecording = false;
      _currentConfig.done(result);
    }
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
