Elm.Native.Graphics.WebGL = {};
Elm.Native.Graphics.WebGL.make = function(elm) {

  elm.Native = elm.Native || {};
  elm.Native.Graphics = elm.Native.Graphics || {};
  elm.Native.Graphics.WebGL = elm.Native.Graphics.WebGL || {};
  if (elm.Native.Graphics.WebGL.values) return elm.Native.Graphics.WebGL.values;

  // setup logging
  function LOG(msg) {
    // console.log(msg);
  }

  var newNode = ElmRuntime.use(ElmRuntime.Render.Utils).newElement;
  var newElement = Elm.Graphics.Element.make(elm).newElement;

  var List = Elm.Native.List.make(elm);
  var MJS = Elm.Native.MJS.make(elm);
  var Utils = Elm.Native.Utils.make(elm);
  var Signal = Elm.Signal.make(elm);
  var Tuple2 = Utils.Tuple2;

  function unsafeCoerceGLSL(src) {
    return { src : src };
  }

  function loadTex(source) {

    var response = Signal.constant(elm.Http.values.Waiting);

    var img = new Image();

    img.onload = function() {
      var success = elm.Http.values.Success({img:img});
      elm.notify(response.id, success);
    }

    img.onerror = function(e) {
      var failure = A2(elm.Http.values.Failure,0,"Failed");
      elm.notify(response.id, failure);
    }

    img.src = source;

    return response;

  }

  function entity(vert, frag, buffer, uniforms) {

    if (!buffer.guid) {
      buffer.guid = Utils.guid();
    }

    return {
      vert: vert,
      frag: frag,
      buffer: buffer,
      uniforms: uniforms
    };

  }

  function do_texture (gl, img) {

    var tex = gl.createTexture();
    LOG("Created texture");
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
    //gl.bindTexture(gl.TEXTURE0, null);
    return tex;

  }

  function do_compile (gl, src, tipe) {

    var shader = gl.createShader(tipe);
    LOG("Created shader");

    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    var compile = gl.COMPILE_STATUS;
    if (!gl.getShaderParameter(shader,compile)) {
      throw gl.getShaderInfoLog(shader);
    }

    return shader;

  }

  function do_link (gl, vshader, fshader) {

    var program = gl.createProgram();
    LOG("Created program");

    gl.attachShader(program, vshader);
    gl.attachShader(program, fshader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw gl.getProgramInfoLog(program);
    }

    return program;

  }

  function do_bind (gl, program, bufferElems) {

    var buffers = {};

    var attributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (var i = 0; i < attributes; i += 1) {
      var attribute = gl.getActiveAttrib(program, i);
      switch (attribute.type) {
        case gl.FLOAT_VEC2:

          // Might want to invert the loop
          // to build the array buffer first
          // and then bind each one-at-a-time
          var data = [];
          List.each(function(elem){
            data.push(elem._0[attribute.name][0]);
            data.push(elem._0[attribute.name][1]);
            data.push(elem._1[attribute.name][0]);
            data.push(elem._1[attribute.name][1]);
            data.push(elem._2[attribute.name][0]);
            data.push(elem._2[attribute.name][1]);
          }, bufferElems);
          var array = new Float32Array(data);

          var buffer = gl.createBuffer();
          LOG("Created attribute buffer " + attribute.name);
          gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
          gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);

          buffers[attribute.name] = buffer;

          break;

        case gl.FLOAT_VEC3:

          // Might want to invert the loop
          // to build the array buffer first
          // and then bind each one-at-a-time
          var data = [];
          List.each(function(elem){
            data.push(elem._0[attribute.name][0]);
            data.push(elem._0[attribute.name][1]);
            data.push(elem._0[attribute.name][2]);
            data.push(elem._1[attribute.name][0]);
            data.push(elem._1[attribute.name][1]);
            data.push(elem._1[attribute.name][2]);
            data.push(elem._2[attribute.name][0]);
            data.push(elem._2[attribute.name][1]);
            data.push(elem._2[attribute.name][2]);
          }, bufferElems);
          var array = new Float32Array(data);

          var buffer = gl.createBuffer();
          LOG("Created attribute buffer " + attribute.name);
          gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
          gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);

          buffers[attribute.name] = buffer;

          break;

        case gl.FLOAT_VEC4:

          // Might want to invert the loop
          // to build the array buffer first
          // and then bind each one-at-a-time
          var data = [];
          List.each(function(elem){
            data.push(elem._0[attribute.name][0]);
            data.push(elem._0[attribute.name][1]);
            data.push(elem._0[attribute.name][2]);
            data.push(elem._0[attribute.name][3]);
            data.push(elem._1[attribute.name][0]);
            data.push(elem._1[attribute.name][1]);
            data.push(elem._1[attribute.name][2]);
            data.push(elem._1[attribute.name][3]);
            data.push(elem._2[attribute.name][0]);
            data.push(elem._2[attribute.name][1]);
            data.push(elem._2[attribute.name][2]);
            data.push(elem._2[attribute.name][3]);
          }, bufferElems);
          var array = new Float32Array(data);

          var buffer = gl.createBuffer();
          LOG("Created attribute buffer " + attribute.name);
          gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
          gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);

          buffers[attribute.name] = buffer;

          break;

        default:
          LOG("Bad buffer type");
          break;
      }

    }

    var numIndices = 3 * List.length(bufferElems);
    var indices = List.toArray(List.range(0, numIndices - 1));
    LOG("Created index buffer");
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    var bufferObject = {
      numIndices: numIndices,
      indexBuffer: indexBuffer,
      buffers: buffers
    };

    return bufferObject;

  }

  function drawGL(model) {

    var gl = model.cache.gl;

    gl.viewport(0, 0, model.w, model.h);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    LOG("Drawing");

    function drawEntity(entity) {

      var program;
      if (entity.vert.id && entity.frag.id) {
        var progid = entity.vert.id + '#' + entity.frag.id;
        program = model.cache.programs[progid];
      }

      if (!program) {

        var vshader = undefined;
        if (entity.vert.id) {
          vshader = model.cache.shaders[entity.vert.id];
        } else {
          entity.vert.id = Utils.guid();
        }

        if (!vshader) {
          vshader = do_compile(gl, entity.vert.src, gl.VERTEX_SHADER);
          model.cache.shaders[entity.vert.id] = vshader;
        }

        var fshader = undefined;
        if (entity.frag.id) {
          fshader = model.cache.shaders[entity.frag.id];
        } else {
          entity.frag.id = Utils.guid();
        }

        if (!fshader) {
          fshader = do_compile(gl, entity.frag.src, gl.FRAGMENT_SHADER);
          model.cache.shaders[entity.frag.id] = fshader;
        }

        program = do_link(gl, vshader, fshader);
        var progid = entity.vert.id + '#' + entity.frag.id;
        model.cache.programs[progid] = program;

      }

      gl.useProgram(program);

      var numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
      var textureCounter = 0;
      for (var i = 0; i < numUniforms; i += 1) {
        var uniform = gl.getActiveUniform(program, i);
        var uniformLocation = gl.getUniformLocation(program, uniform.name);
        switch (uniform.type) {
          case gl.INT:
            gl.uniform1i(uniformLocation, entity.uniforms[uniform.name]);
            break;
          case gl.FLOAT:
            gl.uniform1f(uniformLocation, entity.uniforms[uniform.name]);
            break;
          case gl.FLOAT_VEC3:
            gl.uniform3fv(uniformLocation, entity.uniforms[uniform.name]);
            break;
          case gl.FLOAT_MAT4:
            gl.uniformMatrix4fv(uniformLocation, false, entity.uniforms[uniform.name]);
            break;
          case gl.SAMPLER_2D:
            var texture = entity.uniforms[uniform.name];
            var tex = undefined;
            if (texture.id) {
              tex = model.cache.textures[texture.id];
            } else {
              texture.id = Utils.guid();
            }
            if (!tex) {
              tex = do_texture(gl, texture.img);
              model.cache.textures[texture.id] = tex;
            }
            var activeName = 'TEXTURE' + textureCounter;
            gl.activeTexture(gl[activeName]);
            gl.bindTexture(gl.TEXTURE_2D,tex);
            gl.uniform1i(uniformLocation, textureCounter);
            textureCounter += 1;
            break;
          default:
            LOG("Unsupported uniform type: " + uniform.type);
            break;
        }
      }

      var buffer = model.cache.buffers[entity.buffer.guid];
      if (!buffer) {
        buffer = do_bind(gl, program, entity.buffer);
        model.cache.buffers[entity.buffer.guid] = buffer;
      }

      var numIndices = buffer.numIndices;
      var indexBuffer = buffer.indexBuffer;
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

      var numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
      for (var i = 0; i < numAttributes; i += 1) {
        var attribute = gl.getActiveAttrib(program, i);
        var attribLocation = gl.getAttribLocation(program, attribute.name);
        gl.enableVertexAttribArray(attribLocation);
        var attributeBuffer = buffer.buffers[attribute.name];

        switch (attribute.type) {
          case gl.FLOAT_VEC2:
            gl.bindBuffer(gl.ARRAY_BUFFER, attributeBuffer);
            gl.vertexAttribPointer(attribLocation, 2, gl.FLOAT, false, 0, 0);
            break;
          case gl.FLOAT_VEC3:
            gl.bindBuffer(gl.ARRAY_BUFFER, attributeBuffer);
            gl.vertexAttribPointer(attribLocation, 3, gl.FLOAT, false, 0, 0);
            break;
          case gl.FLOAT_VEC4:
            gl.bindBuffer(gl.ARRAY_BUFFER, attributeBuffer);
            gl.vertexAttribPointer(attribLocation, 4, gl.FLOAT, false, 0, 0);
            break;
          default:
            LOG("Unsupported attribute type: " + attribute.type);
            break;
        }
      }

      gl.drawElements(gl.TRIANGLES, numIndices, gl.UNSIGNED_SHORT, 0);

    }

    List.each(drawEntity, model.models);

  }

  function webgl(dimensions, models) {

    var w = dimensions._0;
    var h = dimensions._1;

    function render(model) {

      var div = newNode('div');
      div.style.overflow = 'hidden';
      var canvas = newNode('canvas');
      var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

      if (gl) {
        gl.enable(gl.DEPTH_TEST);
      } else {
        div.innerHTML =
          '<div style="display: table-cell; text-align: center; width: ' + w + 'px; height: ' + h +
          'px; vertical-align: middle;"><a href="http://get.webgl.org/">Enable WebGL</a> to see this content!</div>';
      }

      model.cache.gl = gl;
      model.cache.canvas = canvas;
      model.cache.shaders = [];
      model.cache.programs = {};
      model.cache.buffers = [];
      model.cache.textures = [];

      update(div, model, model);

      return div;

    }

    function update(div, oldModel, newModel) {

      newModel.cache = oldModel.cache;

      var canvas = newModel.cache.canvas;

      canvas.style.width = oldModel.w + 'px';
      canvas.style.height = oldModel.h + 'px';
      canvas.style.display = "block";
      canvas.style.position = "absolute";
      canvas.width = oldModel.w;
      canvas.height = oldModel.h;

      if (newModel.cache.gl) {
        drawGL(newModel);
      } else {
        div.firstChild.width = newModel.w + 'px';
        div.firstChild.height = newModel.h + 'px';
      }

      div.appendChild(canvas);

    }

    var elem = {
      ctor: 'Custom',
      type: 'WebGL',
      render: render,
      update: update,
      model: {
        models: models,
        cache: {},
        w: w,
        h: h
      }
    };

    return A3(newElement, w, h, elem);

  }

  return elm.Native.Graphics.WebGL.values = {
    unsafeCoerceGLSL:unsafeCoerceGLSL,
    loadTex:loadTex,
    entity:F4(entity),
    webgl:F2(webgl)
  };

};
Elm.Main = Elm.Main || {};
Elm.Main.make = function (_elm) {
   "use strict";
   _elm.Main = _elm.Main || {};
   if (_elm.Main.values)
   return _elm.Main.values;
   var _op = {},
   _N = Elm.Native,
   _U = _N.Utils.make(_elm),
   _L = _N.List.make(_elm),
   _A = _N.Array.make(_elm),
   _E = _N.Error.make(_elm),
   $moduleName = "Main",
   $Basics = Elm.Basics.make(_elm),
   $Graphics$Element = Elm.Graphics.Element.make(_elm),
   $Graphics$WebGL = Elm.Graphics.WebGL.make(_elm),
   $Keyboard = Elm.Keyboard.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $Time = Elm.Time.make(_elm),
   $Window = Elm.Window.make(_elm);
   var display = F2(function (_v0,
   state) {
      return function () {
         switch (_v0.ctor)
         {case "_Tuple2":
            return A2($Graphics$WebGL.webgl,
              {ctor: "_Tuple2"
              ,_0: _v0._0
              ,_1: _v0._1},
              _L.fromArray([]));}
         _E.Case($moduleName,
         "on line 24, column 24 to 39");
      }();
   });
   var delta = A2($Signal._op["<~"],
   $Time.inSeconds,
   $Time.fps(60));
   var Input = F2(function (a,b) {
      return {_: {}
             ,shift: a
             ,time: b};
   });
   var input = $Signal.sampleOn(delta)(A2($Signal._op["~"],
   A2($Signal._op["<~"],
   Input,
   $Keyboard.shift),
   delta));
   var State = {_: {}};
   var emptyState = State;
   var stepStuff = F2(function (_v4,
   _v5) {
      return function () {
         return function () {
            return emptyState;
         }();
      }();
   });
   var state = A3($Signal.foldp,
   stepStuff,
   emptyState,
   input);
   var main = A3($Signal.lift2,
   display,
   $Window.dimensions,
   state);
   _elm.Main.values = {_op: _op
                      ,State: State
                      ,Input: Input
                      ,emptyState: emptyState
                      ,delta: delta
                      ,input: input
                      ,state: state
                      ,stepStuff: stepStuff
                      ,display: display
                      ,main: main};
   return _elm.Main.values;
};Elm.Graphics = Elm.Graphics || {};
Elm.Graphics.WebGL = Elm.Graphics.WebGL || {};
Elm.Graphics.WebGL.make = function (_elm) {
   "use strict";
   _elm.Graphics = _elm.Graphics || {};
   _elm.Graphics.WebGL = _elm.Graphics.WebGL || {};
   if (_elm.Graphics.WebGL.values)
   return _elm.Graphics.WebGL.values;
   var _op = {},
   _N = Elm.Native,
   _U = _N.Utils.make(_elm),
   _L = _N.List.make(_elm),
   _A = _N.Array.make(_elm),
   _E = _N.Error.make(_elm),
   $moduleName = "Graphics.WebGL",
   $Graphics$Element = Elm.Graphics.Element.make(_elm),
   $Http = Elm.Http.make(_elm),
   $Native$Graphics$WebGL = Elm.Native.Graphics.WebGL.make(_elm),
   $Signal = Elm.Signal.make(_elm);
   var webgl = $Native$Graphics$WebGL.webgl;
   var entity = $Native$Graphics$WebGL.entity;
   var Entity = {ctor: "Entity"};
   var loadTexture = $Native$Graphics$WebGL.loadTex;
   var Texture = {ctor: "Texture"};
   var unsafeShader = $Native$Graphics$WebGL.unsafeCoerceGLSL;
   var Shader = {ctor: "Shader"};
   var zipTriangle = F3(function (f,
   _v0,
   _v1) {
      return function () {
         switch (_v1.ctor)
         {case "_Tuple3":
            return function () {
                 switch (_v0.ctor)
                 {case "_Tuple3":
                    return {ctor: "_Tuple3"
                           ,_0: A2(f,_v0._0,_v1._0)
                           ,_1: A2(f,_v0._1,_v1._1)
                           ,_2: A2(f,_v0._2,_v1._2)};}
                 _E.Case($moduleName,
                 "on line 50, column 37 to 59");
              }();}
         _E.Case($moduleName,
         "on line 50, column 37 to 59");
      }();
   });
   var mapTriangle = F2(function (f,
   _v10) {
      return function () {
         switch (_v10.ctor)
         {case "_Tuple3":
            return {ctor: "_Tuple3"
                   ,_0: f(_v10._0)
                   ,_1: f(_v10._1)
                   ,_2: f(_v10._2)};}
         _E.Case($moduleName,
         "on line 44, column 26 to 39");
      }();
   });
   _elm.Graphics.WebGL.values = {_op: _op
                                ,mapTriangle: mapTriangle
                                ,zipTriangle: zipTriangle
                                ,Shader: Shader
                                ,unsafeShader: unsafeShader
                                ,Texture: Texture
                                ,loadTexture: loadTexture
                                ,Entity: Entity
                                ,entity: entity
                                ,webgl: webgl};
   return _elm.Graphics.WebGL.values;
};