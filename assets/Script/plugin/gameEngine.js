var KKVS = require("./KKVS")
var ByteBuffer = require("./ByteBuffer");

var WSSTR = 'wss://'

var gameEngine = gameEngine || {};

/*-----------------------------------------------------------------------------------------
 JavaScript Inheritance
 -----------------------------------------------------------------------------------------*/
/* Simple JavaScript Inheritance
 * By Kent
 */
gameEngine.Class = function () {
};
gameEngine.Class.extend = function (props) {
    var _super = this.prototype;
    var fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
	// Set up the prototype to inherit from the base class
	// (but without running the ctor constructor)
	var proto = Object.create(_super);

	// Copy the properties over onto the new prototype
	for (var name in props) {
		// Check if we're overwriting an existing function
		proto[name] = typeof props[name] === "function" &&
		typeof _super[name] == "function" && fnTest.test(props[name])
			? (function(name, fn){
				return function() {
					var tmp = this._super;

					// Add a new ._super() method that is the same method
					// but on the super-class
					this._super = _super[name];

					// The method only need to be bound temporarily, so we
					// remove it when we're done executing
					var ret = fn.apply(this, arguments);
					this._super = tmp;

					return ret;
				};
			})(name, props[name])
			: props[name];
	}

	// The new constructor
	var newClass = typeof proto.ctor === "function"
		? proto.hasOwnProperty("ctor")
			? proto.ctor // All construction is actually done in the ctor method
			: function SubClass(){ _super.ctor.apply(this, arguments); }
		: function EmptyClass(){};

	// Populate our constructed prototype object
	newClass.prototype = proto;

	// Enforce the constructor to be what we expect
	proto.constructor = newClass;

	// And make this class extendable
	newClass.extend = gameEngine.Class.extend;

	return newClass;
};
// export
window.Class = gameEngine.Class;
/*-----------------------------------------------------------------------------------------
 global
 -----------------------------------------------------------------------------------------*/
gameEngine.PACKET_MAX_SIZE = 1500;
gameEngine.PACKET_MAX_SIZE_TCP = 1460;
gameEngine.PACKET_MAX_SIZE_UDP = 1472;

gameEngine.MESSAGE_ID_LENGTH = 2;
gameEngine.MESSAGE_LENGTH_LENGTH = 2;

gameEngine.CLIENT_NO_FLOAT = 0;
gameEngine.KBE_FLT_MAX = 3.402823466e+38;

/*-----------------------------------------------------------------------------------------
 number64bits
 -----------------------------------------------------------------------------------------*/
gameEngine.INT64 = function (lo, hi) {
    this.lo = lo;
    this.hi = hi;

    this.sign = 1;

    if (hi >= 2147483648) {
        this.sign = -1;
        if (this.lo > 0) {
            this.lo = (4294967296 - this.lo) & 0xffffffff;
            this.hi = 4294967295 - this.hi;
        }
        else {
            this.lo = (4294967296 - this.lo) & 0xffffffff;
            this.hi = 4294967296 - this.hi;
        }
    }

    this.toString = function () {
        var result = "";

        if (this.sign < 0) {
            result += "-"
        }

        var low = this.lo.toString(16);
        var high = this.hi.toString(16);

        if (this.hi > 0) {
            result += high;
            for (var i = 8 - low.length; i > 0; --i) {
                result += "0";
            }
        }
        result += low;

        return result;

    }
}

gameEngine.UINT64 = function (lo, hi) {
    this.lo = lo;
    this.hi = hi;

    this.toString = function () {
        var low = this.lo.toString(16);
        var high = this.hi.toString(16);

        var result = "";
        if (this.hi > 0) {
            result += high;
            for (var i = 8 - low.length; i > 0; --i) {
                result += "0";
            }
        }
        result += low;
        return result;
    }
}

/*-----------------------------------------------------------------------------------------
 debug
 -----------------------------------------------------------------------------------------*/
gameEngine.INFO_MSG = function (s) {
    cc.log(s);
}

gameEngine.DEBUG_MSG = function (s) {
    cc.log(s);
}

gameEngine.ERROR_MSG = function (s) {
    cc.log(s);
}

gameEngine.WARNING_MSG = function (s) {
    cc.log(s);
}

/*-----------------------------------------------------------------------------------------
 string
 -----------------------------------------------------------------------------------------*/
gameEngine.utf8ArrayToString = function (array) {
    var out, i, len, c;
    var char2, char3;

    out = "";
    len = array.length;
    i = 0;

    while (i < len) {
        c = array[i++];

        switch (c >> 4) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                // 0xxxxxxx
                out += String.fromCharCode(c);
                break;
            case 12:
            case 13:
                // 110x xxxx   10xx xxxx
                char2 = array[i++];
                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;
            case 14:
                // 1110 xxxx  10xx xxxx  10xx xxxx
                char2 = array[i++];
                char3 = array[i++];
                out += String.fromCharCode(((c & 0x0F) << 12) |
                    ((char2 & 0x3F) << 6) |
                    ((char3 & 0x3F) << 0));
                break;
        }
    }

    return out;
}

gameEngine.stringToUTF8Bytes = function (str) {
    var utf8 = [];
    for (var i = 0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6),
                0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(0xe0 | (charcode >> 12),
                0x80 | ((charcode >> 6) & 0x3f),
                0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
            i++;
            // UTF-16 encodes 0x10000-0x10FFFF by
            // subtracting 0x10000 and splitting the
            // 20 bits of 0x0-0xFFFFF into two halves
            charcode = 0x10000 + (((charcode & 0x3ff) << 10)
                | (str.charCodeAt(i) & 0x3ff))
            utf8.push(0xf0 | (charcode >> 18),
                0x80 | ((charcode >> 12) & 0x3f),
                0x80 | ((charcode >> 6) & 0x3f),
                0x80 | (charcode & 0x3f));
        }
    }
    return utf8;
}

/*-----------------------------------------------------------------------------------------
 event
 -----------------------------------------------------------------------------------------*/
gameEngine.EventInfo = function (classinst, callbackfn) {
    this.callbackfn = callbackfn;
    this.classinst = classinst;
}

gameEngine.Event = function () {
    this._events = {};

    this.register = function (evtName, classinst, strCallback) {
        var callbackfn = classinst[strCallback];
        if (callbackfn == undefined) {
            gameEngine.ERROR_MSG('gameEngine.Event::fire: not found strCallback(' + classinst + ")!" + strCallback);
            return;
        }

        var evtlst = this._events[evtName];
        if (evtlst == undefined) {
            evtlst = [];
            this._events[evtName] = evtlst;
        }

        var info = new gameEngine.EventInfo(classinst, callbackfn);
        evtlst.push(info);
    }

    this.deregister = function (evtName, classinst) {
        for (var itemkey in this._events) {
            var evtlst = this._events[itemkey];
            while (true) {
                var found = false;
                for (var i = 0; i < evtlst.length; i++) {
                    var info = evtlst[i];
                    if (info.classinst == classinst) {
                        evtlst.splice(i, 1);
                        found = true;
                        break;
                    }
                }

                if (!found)
                    break;
            }
        }
    }

    this.fire = function () {
        if (arguments.length < 1) {
            gameEngine.ERROR_MSG('gameEngine.Event::fire: not found eventName!');
            return;
        }

        var evtName = arguments[0];
        var evtlst = this._events[evtName];

        if (evtlst == undefined) {
            return;
        }

        var ars = [];
        for (var i = 1; i < arguments.length; i++)
            ars.push(arguments[i]);

        for (var i = 0; i < evtlst.length; i++) {
            var info = evtlst[i];
            if (arguments.length < 1) {
                info.callbackfn.apply(info.classinst);
            }
            else {
                info.callbackfn.apply(info.classinst, ars);
            }
        }
    }
}

gameEngine.Event = new gameEngine.Event();

/*-----------------------------------------------------------------------------------------
 memorystream
 -----------------------------------------------------------------------------------------*/
gameEngine.MemoryStream = function (size_or_buffer) {
    if (size_or_buffer instanceof ArrayBuffer) {
        this.buffer = size_or_buffer;
    }
    else {
        this.buffer = new ArrayBuffer(size_or_buffer);
    }

    this.rpos = 0;
    this.wpos = 0;

    /*
     union PackFloatXType
     {
     float	fv;
     uint32	uv;
     int		iv;
     };	
     */
    gameEngine.MemoryStream.PackFloatXType = function () {
        this._unionData = new ArrayBuffer(4);
        this.fv = new Float32Array(this._unionData, 0, 1);
        this.uv = new Uint32Array(this._unionData, 0, 1);
        this.iv = new Int32Array(this._unionData, 0, 1);
    };

    //---------------------------------------------------------------------------------
    this.readInt8 = function () {
        var buf = new Int8Array(this.buffer, this.rpos, 1);
        this.rpos += 1;
        return buf[0];
    }

    this.readInt16 = function () {
        var v = this.readUint16();
        if (v >= 32768)
            v -= 65536;
        return v;
    }

    this.readInt32 = function () {
        var buffers = this.buffer.slice(this.rpos, this.rpos + 4);
        var byteBuffer = ByteBuffer.wrap(buffers, "utf8", ByteBuffer.LITTLE_ENDIAN);
        var ret = byteBuffer.readInt32();
        this.rpos += 4;
        return ret;
    }

    this.readInt64 = function () {
        var buffers = this.buffer.slice(this.rpos, this.rpos + 8);
        var byteBuffer = ByteBuffer.wrap(buffers, "utf8", ByteBuffer.LITTLE_ENDIAN);
        var ret = byteBuffer.readInt64();
        this.rpos += 8;
        return ret;
        //return new gameEngine.INT64(this.readUint32(), this.readUint32());
    }

    this.readUint8 = function () {
        var buf = new Uint8Array(this.buffer, this.rpos, 1);
        this.rpos += 1;
        return buf[0];
    }

    this.readUint16 = function () {
        var buf = new Uint8Array(this.buffer, this.rpos);
        this.rpos += 2;
        return ((buf[1] & 0xff) << 8) + (buf[0] & 0xff);
    }

    this.readUint32 = function () {
        // var buf = new Uint8Array(this.buffer, this.rpos);
        // this.rpos += 4;
        // return (buf[3] << 24) + (buf[2] << 16) + (buf[1] << 8) + buf[0];
        var buffers = this.buffer.slice(this.rpos, this.rpos + 4);
        var byteBuffer = ByteBuffer.wrap(buffers, "utf8", ByteBuffer.LITTLE_ENDIAN);
        var ret = byteBuffer.readUint32();
        this.rpos += 4;
        return ret;
    }

    this.readUint64 = function () {
        //return new gameEngine.UINT64(this.readUint32(), this.readUint32());
        var buffers = this.buffer.slice(this.rpos, this.rpos + 8);
        var byteBuffer = ByteBuffer.wrap(buffers, "utf8", ByteBuffer.LITTLE_ENDIAN);
        var ret = byteBuffer.readUint64();
        this.rpos += 8;
        return ret;
    }

    this.readFloat = function () {
        try {
            var buf = new Float32Array(this.buffer, this.rpos, 1);
        }
        catch (e) {
            var buf = new Float32Array(this.buffer.slice(this.rpos, this.rpos + 4));
        }

        this.rpos += 4;
        return buf[0];
    }

    this.readDouble = function () {
        try {
            var buf = new Float64Array(this.buffer, this.rpos, 1);
        }
        catch (e) {
            var buf = new Float64Array(this.buffer.slice(this.rpos, this.rpos + 8), 0, 1);
        }

        this.rpos += 8;
        return buf[0];
    }

    this.readString = function () {
        var buf = new Uint8Array(this.buffer, this.rpos);
        var i = 0;
        var s = "";

        while (true) {
            if (buf[i] != 0) {
                s += String.fromCharCode(buf[i]);
            }
            else {
                i++;
                break;
            }

            i++;

            if (this.rpos + i >= this.buffer.byteLength)
                throw(new Error("gameEngine.MemoryStream::readString: rpos(" + (this.rpos + i) + ")>=" +
                    this.buffer.byteLength + " overflow!"));
        }

        this.rpos += i;
        return s;
    }

    this.readBlob = function () {
        var size = this.readUint32();
        var buf = new Uint8Array(this.buffer, this.rpos, size);
        this.rpos += size;
        return buf;
    }

    this.readStream = function () {
        var buf = new Uint8Array(this.buffer, this.rpos, this.buffer.byteLength - this.rpos);
        this.rpos = this.buffer.byteLength;
        return new gameEngine.MemoryStream(buf);
    }

    this.readPackXZ = function () {
        var xPackData = new gameEngine.MemoryStream.PackFloatXType();
        var zPackData = new gameEngine.MemoryStream.PackFloatXType();

        xPackData.fv[0] = 0.0;
        zPackData.fv[0] = 0.0;

        xPackData.uv[0] = 0x40000000;
        zPackData.uv[0] = 0x40000000;

        var v1 = this.readUint8();
        var v2 = this.readUint8();
        var v3 = this.readUint8();

        var data = 0;
        data |= (v1 << 16);
        data |= (v2 << 8);
        data |= v3;

        xPackData.uv[0] |= (data & 0x7ff000) << 3;
        zPackData.uv[0] |= (data & 0x0007ff) << 15;

        xPackData.fv[0] -= 2.0;
        zPackData.fv[0] -= 2.0;

        xPackData.uv[0] |= (data & 0x800000) << 8;
        zPackData.uv[0] |= (data & 0x000800) << 20;

        var data = new Array(2);
        data[0] = xPackData.fv[0];
        data[1] = zPackData.fv[0];
        return data;
    }

    this.readPackY = function () {
        var v = this.readUint16();
        return v;
    }

    //---------------------------------------------------------------------------------
    this.writeInt8 = function (v) {
        var buf = new Int8Array(this.buffer, this.wpos, 1);
        buf[0] = v;
        this.wpos += 1;
    }

    this.writeInt16 = function (v) {
        this.writeInt8(v & 0xff);
        this.writeInt8(v >> 8 & 0xff);
    }

    this.writeInt32 = function (v) {
        for (var i = 0; i < 4; i++)
            this.writeInt8(v >> i * 8 & 0xff);
    }

    this.writeInt64 = function (v) {
        this.writeInt32(v.lo);
        this.writeInt32(v.hi);
    }

    this.writeUint8 = function (v) {
        var buf = new Uint8Array(this.buffer, this.wpos, 1);
        buf[0] = v;
        this.wpos += 1;
    }

    this.writeUint16 = function (v) {
        this.writeUint8(v & 0xff);
        this.writeUint8(v >> 8 & 0xff);
    }

    this.writeUint32 = function (v) {
        for (var i = 0; i < 4; i++)
            this.writeUint8(v >> i * 8 & 0xff);
    }

    this.writeUint64 = function (v) {
        this.writeUint32(v.lo);
        this.writeUint32(v.hi);
    }

    this.writeFloat = function (v) {
        try {
            var buf = new Float32Array(this.buffer, this.wpos, 1);
            buf[0] = v;
        }
        catch (e) {
            var buf = new Float32Array(1);
            buf[0] = v;
            var buf1 = new Uint8Array(this.buffer);
            var buf2 = new Uint8Array(buf.buffer);
            buf1.set(buf2, this.wpos);
        }

        this.wpos += 4;
    }

    this.writeDouble = function (v) {
        try {
            var buf = new Float64Array(this.buffer, this.wpos, 1);
            buf[0] = v;
        }
        catch (e) {
            var buf = new Float64Array(1);
            buf[0] = v;
            var buf1 = new Uint8Array(this.buffer);
            var buf2 = new Uint8Array(buf.buffer);
            buf1.set(buf2, this.wpos);
        }

        this.wpos += 8;
    }

    this.writeBlob = function (v) {
        var size = v.length;
        if (size + 4 > this.space()) {
            gameEngine.ERROR_MSG("memorystream::writeBlob: no free!");
            return;
        }

        this.writeUint32(size);
        var buf = new Uint8Array(this.buffer, this.wpos, size);

        if (typeof(v) == "string") {
            for (var i = 0; i < size; i++) {
                buf[i] = v.charCodeAt(i);
            }
        }
        else {
            for (var i = 0; i < size; i++) {
                buf[i] = v[i];
            }
        }

        this.wpos += size;
    }

    this.writeString = function (v) {
        if (v.length > this.space()) {
            gameEngine.ERROR_MSG("memorystream::writeString: no free!");
            return;
        }

        var buf = new Uint8Array(this.buffer, this.wpos);
        var i = 0;
        for (var idx = 0; idx < v.length; idx++) {
            buf[i++] = v.charCodeAt(idx);
        }

        buf[i++] = 0;
        this.wpos += i;
    }

    //---------------------------------------------------------------------------------
    this.readSkip = function (v) {
        this.rpos += v;
    }

    //---------------------------------------------------------------------------------
    this.space = function () {
        return this.buffer.byteLength - this.wpos;
    }

    //---------------------------------------------------------------------------------
    this.length = function () {
        return this.wpos - this.rpos;
    }

    //---------------------------------------------------------------------------------
    this.readEOF = function () {
        return this.buffer.byteLength - this.rpos <= 0;
    }

    //---------------------------------------------------------------------------------
    this.done = function () {
        this.rpos = this.wpos;
    }

    //---------------------------------------------------------------------------------
    this.getbuffer = function (v) {
        return this.buffer.slice(this.rpos, this.wpos);
    }
}

/*-----------------------------------------------------------------------------------------
 bundle
 -----------------------------------------------------------------------------------------*/
gameEngine.Bundle = function () {
    this.memorystreams = new Array();
    this.stream = new gameEngine.MemoryStream(gameEngine.PACKET_MAX_SIZE_TCP);

    this.numMessage = 0;
    this.messageLengthBuffer = null;
    this.messageLength = 0;
    this.msgtype = null;

    //---------------------------------------------------------------------------------
    this.newMessage = function (msgtype) {
        this.fini(false);

        this.msgtype = msgtype;
        this.numMessage += 1;

        if (this.msgtype.length == -1) {
            this.messageLengthBuffer = new Uint8Array(this.stream.buffer, this.stream.wpos + gameEngine.MESSAGE_ID_LENGTH, 2);
        }

        this.writeUint16(msgtype.id);

        if (this.messageLengthBuffer) {
            this.writeUint16(0);
            this.messageLengthBuffer[0] = 0;
            this.messageLengthBuffer[1] = 0;
            this.messageLength = 0;
        }
    }

    //---------------------------------------------------------------------------------
    this.writeMsgLength = function (v) {
        if (this.messageLengthBuffer) {
            this.messageLengthBuffer[0] = v & 0xff;
            this.messageLengthBuffer[1] = v >> 8 & 0xff;
        }
    }

    //---------------------------------------------------------------------------------
    this.fini = function (issend) {
        if (this.numMessage > 0) {
            this.writeMsgLength(this.messageLength);
            if (this.stream)
                this.memorystreams.push(this.stream);
        }

        if (issend) {
            this.messageLengthBuffer = null;
            this.numMessage = 0;
            this.msgtype = null;
        }
    }

    //---------------------------------------------------------------------------------
    this.send = function (network) {
        this.fini(true);

        for (var i = 0; i < this.memorystreams.length; i++) {
            var stream = this.memorystreams[i];
            network.send(stream.getbuffer());
        }

        this.memorystreams = new Array();
        this.stream = new gameEngine.MemoryStream(gameEngine.PACKET_MAX_SIZE_TCP);
    }

    //---------------------------------------------------------------------------------
    this.checkStream = function (v) {
        if (v > this.stream.space()) {
            this.memorystreams.push(this.stream);
            this.stream = new gameEngine.MemoryStream(gameEngine.PACKET_MAX_SIZE_TCP);
        }

        this.messageLength += v;
    }

    //---------------------------------------------------------------------------------
    this.writeInt8 = function (v) {
        this.checkStream(1);
        this.stream.writeInt8(v);
    }

    this.writeInt16 = function (v) {
        this.checkStream(2);
        this.stream.writeInt16(v);
    }

    this.writeInt32 = function (v) {
        this.checkStream(4);
        this.stream.writeInt32(v);
    }

    this.writeInt64 = function (v) {
        this.checkStream(8);
        this.stream.writeInt64(v);
    }

    this.writeUint8 = function (v) {
        this.checkStream(1);
        this.stream.writeUint8(v);
    }

    this.writeUint16 = function (v) {
        this.checkStream(2);
        this.stream.writeUint16(v);
    }

    this.writeUint32 = function (v) {
        this.checkStream(4);
        this.stream.writeUint32(v);
    }

    this.writeUint64 = function (v) {
        this.checkStream(8);
        this.stream.writeUint64(v);
    }

    this.writeFloat = function (v) {
        this.checkStream(4);
        this.stream.writeFloat(v);
    }

    this.writeDouble = function (v) {
        this.checkStream(8);
        this.stream.writeDouble(v);
    }

    this.writeString = function (v) {
        this.checkStream(v.length + 1);
        this.stream.writeString(v);
    }

    this.writeBlob = function (v) {
        this.checkStream(v.length + 4);
        this.stream.writeBlob(v);
    }
}

/*-----------------------------------------------------------------------------------------
 messages
 -----------------------------------------------------------------------------------------*/
gameEngine.reader = new gameEngine.MemoryStream(0);
gameEngine.datatype2id = {};
gameEngine.datatype2id["STRING"] = 1;
gameEngine.datatype2id["STD::STRING"] = 1;

gameEngine.datatype2id["UINT8"] = 2;
gameEngine.datatype2id["BOOL"] = 2;
gameEngine.datatype2id["DATATYPE"] = 2;
gameEngine.datatype2id["CHAR"] = 2;
gameEngine.datatype2id["DETAIL_TYPE"] = 2;
gameEngine.datatype2id["MAIL_TYPE"] = 2;

gameEngine.datatype2id["UINT16"] = 3;
gameEngine.datatype2id["UNSIGNED SHORT"] = 3;
gameEngine.datatype2id["SERVER_ERROR_CODE"] = 3;
gameEngine.datatype2id["ENTITY_TYPE"] = 3;
gameEngine.datatype2id["ENTITY_PROPERTY_UID"] = 3;
gameEngine.datatype2id["ENTITY_METHOD_UID"] = 3;
gameEngine.datatype2id["ENTITY_SCRIPT_UID"] = 3;
gameEngine.datatype2id["DATATYPE_UID"] = 3;

gameEngine.datatype2id["UINT32"] = 4;
gameEngine.datatype2id["UINT"] = 4;
gameEngine.datatype2id["UNSIGNED INT"] = 4;
gameEngine.datatype2id["ARRAYSIZE"] = 4;
gameEngine.datatype2id["SPACE_ID"] = 4;
gameEngine.datatype2id["GAME_TIME"] = 4;
gameEngine.datatype2id["TIMER_ID"] = 4;

gameEngine.datatype2id["UINT64"] = 5;
gameEngine.datatype2id["DBID"] = 5;
gameEngine.datatype2id["COMPONENT_ID"] = 5;

gameEngine.datatype2id["INT8"] = 6;
gameEngine.datatype2id["COMPONENT_ORDER"] = 6;

gameEngine.datatype2id["INT16"] = 7;
gameEngine.datatype2id["SHORT"] = 7;

gameEngine.datatype2id["INT32"] = 8;
gameEngine.datatype2id["INT"] = 8;
gameEngine.datatype2id["ENTITY_ID"] = 8;
gameEngine.datatype2id["CALLBACK_ID"] = 8;
gameEngine.datatype2id["COMPONENT_TYPE"] = 8;

gameEngine.datatype2id["INT64"] = 9;

gameEngine.datatype2id["PYTHON"] = 10;
gameEngine.datatype2id["PY_DICT"] = 10;
gameEngine.datatype2id["PY_TUPLE"] = 10;
gameEngine.datatype2id["PY_LIST"] = 10;
gameEngine.datatype2id["MAILBOX"] = 10;

gameEngine.datatype2id["BLOB"] = 11;

gameEngine.datatype2id["UNICODE"] = 12;

gameEngine.datatype2id["FLOAT"] = 13;

gameEngine.datatype2id["DOUBLE"] = 14;

gameEngine.datatype2id["VECTOR2"] = 15;

gameEngine.datatype2id["VECTOR3"] = 16;

gameEngine.datatype2id["VECTOR4"] = 17;

gameEngine.datatype2id["FIXED_DICT"] = 18;

gameEngine.datatype2id["ARRAY"] = 19;


gameEngine.bindwriter = function (writer, argType) {
    if (argType == gameEngine.datatype2id["UINT8"]) {
        return writer.writeUint8;
    }
    else if (argType == gameEngine.datatype2id["UINT16"]) {
        return writer.writeUint16;
    }
    else if (argType == gameEngine.datatype2id["UINT32"]) {
        return writer.writeUint32;
    }
    else if (argType == gameEngine.datatype2id["UINT64"]) {
        return writer.writeUint64;
    }
    else if (argType == gameEngine.datatype2id["INT8"]) {
        return writer.writeInt8;
    }
    else if (argType == gameEngine.datatype2id["INT16"]) {
        return writer.writeInt16;
    }
    else if (argType == gameEngine.datatype2id["INT32"]) {
        return writer.writeInt32;
    }
    else if (argType == gameEngine.datatype2id["INT64"]) {
        return writer.writeInt64;
    }
    else if (argType == gameEngine.datatype2id["FLOAT"]) {
        return writer.writeFloat;
    }
    else if (argType == gameEngine.datatype2id["DOUBLE"]) {
        return writer.writeDouble;
    }
    else if (argType == gameEngine.datatype2id["STRING"]) {
        return writer.writeString;
    }
    else if (argType == gameEngine.datatype2id["FIXED_DICT"]) {
        return writer.writeStream;
    }
    else if (argType == gameEngine.datatype2id["ARRAY"]) {
        return writer.writeStream;
    }
    else {
        return writer.writeStream;
    }
}

gameEngine.bindReader = function (argType) {
    if (argType == gameEngine.datatype2id["UINT8"]) {
        return gameEngine.reader.readUint8;
    }
    else if (argType == gameEngine.datatype2id["UINT16"]) {
        return gameEngine.reader.readUint16;
    }
    else if (argType == gameEngine.datatype2id["UINT32"]) {
        return gameEngine.reader.readUint32;
    }
    else if (argType == gameEngine.datatype2id["UINT64"]) {
        return gameEngine.reader.readUint64;
    }
    else if (argType == gameEngine.datatype2id["INT8"]) {
        return gameEngine.reader.readInt8;
    }
    else if (argType == gameEngine.datatype2id["INT16"]) {
        return gameEngine.reader.readInt16;
    }
    else if (argType == gameEngine.datatype2id["INT32"]) {
        return gameEngine.reader.readInt32;
    }
    else if (argType == gameEngine.datatype2id["INT64"]) {
        return gameEngine.reader.readInt64;
    }
    else if (argType == gameEngine.datatype2id["FLOAT"]) {
        return gameEngine.reader.readFloat;
    }
    else if (argType == gameEngine.datatype2id["DOUBLE"]) {
        return gameEngine.reader.readDouble;
    }
    else if (argType == gameEngine.datatype2id["STRING"]) {
        return gameEngine.reader.readString;
    }
    else if (argType == gameEngine.datatype2id["PYTHON"]) {
        return gameEngine.reader.readStream;
    }
    else if (argType == gameEngine.datatype2id["VECTOR2"]) {
        return gameEngine.reader.readStream;
    }
    else if (argType == gameEngine.datatype2id["VECTOR3"]) {
        return gameEngine.reader.readStream;
    }
    else if (argType == gameEngine.datatype2id["VECTOR4"]) {
        return gameEngine.reader.readStream;
    }
    else if (argType == gameEngine.datatype2id["BLOB"]) {
        return gameEngine.reader.readStream;
    }
    else if (argType == gameEngine.datatype2id["UNICODE"]) {
        return gameEngine.reader.readStream;
    }
    else if (argType == gameEngine.datatype2id["FIXED_DICT"]) {
        return gameEngine.reader.readStream;
    }
    else if (argType == gameEngine.datatype2id["ARRAY"]) {
        return gameEngine.reader.readStream;
    }
    else {
        return gameEngine.reader.readStream;
    }
}

gameEngine.Message = function (id, name, length, argstype, args, handler) {
    this.id = id;
    this.name = name;
    this.length = length;
    this.argsType = argstype;

    // 绑定执行
    for (var i = 0; i < args.length; i++) {
        args[i] = gameEngine.bindReader(args[i]);
    }

    this.args = args;
    this.handler = handler;

    this.createFromStream = function (msgstream) {
        if (this.args.length <= 0)
            return msgstream;

        var result = new Array(this.args.length);
        for (var i = 0; i < this.args.length; i++) {
            result[i] = this.args[i].call(msgstream);
        }

        return result;
    }

    this.handleMessage = function (msgstream) {
        if (this.handler == null) {
            gameEngine.ERROR_MSG("gameEngine.Message::handleMessage: interface(" + this.name + "/" + this.id + ") no implement!");
            return;
        }

        if (this.args.length <= 0) {
            if (this.argsType < 0)
                this.handler(msgstream);
            else
                this.handler();
        }
        else {
            this.handler.apply(gameEngine.app, this.createFromStream(msgstream));
        }
    }
}

// 上行消息
gameEngine.messages = {};
gameEngine.messages["loginapp"] = {};
gameEngine.messages["baseapp"] = {};
gameEngine.clientmessages = {};

gameEngine.messages["Loginapp_importClientMessages"] = new gameEngine.Message(5, "importClientMessages", 0, 0, new Array(), null);
gameEngine.messages["Baseapp_importClientMessages"] = new gameEngine.Message(207, "importClientMessages", 0, 0, new Array(), null);
gameEngine.messages["Baseapp_importClientEntityDef"] = new gameEngine.Message(208, "importClientEntityDef", 0, 0, new Array(), null);
gameEngine.messages["onImportClientMessages"] = new gameEngine.Message(518, "onImportClientMessages", -1, -1, new Array(), null);

gameEngine.bufferedCreateEntityMessage = {};

/*-----------------------------------------------------------------------------------------
 math
 -----------------------------------------------------------------------------------------*/
gameEngine.Vector3 = gameEngine.Class.extend(
    {
        ctor: function (x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
            return true;
        },

        distance: function (pos) {
            var x = pos.x - this.x;
            var y = pos.y - this.y;
            var z = pos.z - this.z;
            return Math.sqrt(x * x + y * y + z * z);
        }
    });

gameEngine.clampf = function (value, min_inclusive, max_inclusive) {
    if (min_inclusive > max_inclusive) {
        var temp = min_inclusive;
        min_inclusive = max_inclusive;
        max_inclusive = temp;
    }
    return value < min_inclusive ? min_inclusive : value < max_inclusive ? value : max_inclusive;
};

gameEngine.int82angle = function (angle/*int8*/, half/*bool*/) {
    return angle * (Math.PI / (half ? 254.0 : 128.0));
};

gameEngine.angle2int8 = function (v/*float*/, half/*bool*/) {
    var angle = 0;
    if (!half) {
        angle = Math.floor((v * 128.0) / float(Math.PI) + 0.5);
    }
    else {
        angle = gameEngine.clampf(floorf((v * 254.0) / float(Math.PI) + 0.5), -128.0, 127.0);
    }

    return angle;
};

/*-----------------------------------------------------------------------------------------
 entity
 -----------------------------------------------------------------------------------------*/
gameEngine.Entity = gameEngine.Class.extend(
    {
        ctor: function () {
            this.id = 0;
            this.className = "";
            this.position = new gameEngine.Vector3(0.0, 0.0, 0.0);
            this.direction = new gameEngine.Vector3(0.0, 0.0, 0.0);
            this.velocity = 0.0

            this.cell = null;
            this.base = null;

            // enterworld之后设置为true
            this.inWorld = false;

            // __init__调用之后设置为true
            this.inited = false;
            return true;
        },

        // 与服务端实体脚本中__init__类似, 代表初始化实体
        __init__: function () {
        },

        callPropertysSetMethods: function () {
            var currModule = gameEngine.moduledefs[this.className];
            for (var name in currModule.propertys) {
                var propertydata = currModule.propertys[name];
                var properUtype = propertydata[0];
                var name = propertydata[2];
                var setmethod = propertydata[5];
                var flags = propertydata[6];
                var oldval = this[properUtype];

                if (setmethod != null) {
                    // base类属性或者进入世界后cell类属性会触发set_*方法
                    if (flags == 0x00000020 || flags == 0x00000040) {
                        if (this.inited && !this.inWorld)
                            setmethod.apply(this, oldval);
                    }
                    else {
                        if (this.inWorld)
                            setmethod.apply(this, oldval);
                    }
                }
            }
            ;
        },

        onDestroy: function () {
        },

        isPlayer: function () {
            return this.id == gameEngine.app.entity_id;
        },
        gameBaseCall: function (key,params) {
        
        //    if (arguments.length < 1) {
        //        gameEngine.ERROR_MSG('gameEngine.Entity::baseCall: not fount interfaceName!');
        //        return;
        //    }
        
           if (this.base == undefined) {
               gameEngine.ERROR_MSG('gameEngine.Entity::cellCall: cell is None!');
               return;
           }
        
           var method = gameEngine.moduledefs[this.className].base_methods[key];
           var methodID = method[0];
           var args = method[3];
        
           if (params.length != args.length) {
               gameEngine.ERROR_MSG("gameEngine.Entity::baseCall: args(" + (params.length) + "!= " + args.length + ") size is error!");
               return;
           }
        
           this.base.newMail();
           this.base.bundle.writeUint16(methodID);
        
           try {
               for (var i = 0; i < params.length; i++) {
                   if (args[i].isSameType(params[i])) {
                       args[i].addToStream(this.base.bundle, params[i]);
                   }
                   else {
                       throw new Error("gameEngine.Entity::baseCall: arg[" + i + "] is error!");
                   }
               }
           }
           catch (e) {
               gameEngine.ERROR_MSG(e.toString());
               gameEngine.ERROR_MSG('gameEngine.Entity::baseCall: args is error!');
               this.base.bundle = null;
               return;
           }
        
           this.base.postMail();
        },
        baseCall: function () {
            if (arguments.length < 1) {
                gameEngine.ERROR_MSG('gameEngine.Entity::baseCall: not fount interfaceName!');
                return;
            }

            if (this.base == undefined) {
                gameEngine.ERROR_MSG('gameEngine.Entity::cellCall: cell is None!');
                return;
            }

            var method = gameEngine.moduledefs[this.className].base_methods[arguments[0]];
            var methodID = method[0];
            var args = method[3];

            if (arguments.length - 1 != args.length) {
                gameEngine.ERROR_MSG("gameEngine.Entity::baseCall: args(" + (arguments.length - 1) + "!= " + args.length + ") size is error!");
                return;
            }

            this.base.newMail();
            this.base.bundle.writeUint16(methodID);
            // cc.log("gameEngine baseCall :");
            // cc.log("methodID = " + methodID.toString());
            try {
                for (var i = 0; i < args.length; i++) {
                    if (args[i].isSameType(arguments[i + 1])) {
                        args[i].addToStream(this.base.bundle, arguments[i + 1]);
                        // cc.log("arguments " + i + " = " + arguments[i + 1]);
                    }
                    else {
                        throw new Error("gameEngine.Entity::baseCall: arg[" + i + "] is error!");
                    }
                }
            }
            catch (e) {
                gameEngine.ERROR_MSG(e.toString());
                gameEngine.ERROR_MSG('gameEngine.Entity::baseCall: args is error!');
                this.base.bundle = null;
                return;
            }

            this.base.postMail();
        },

        cellCall: function () {
            if (arguments.length < 1) {
                gameEngine.ERROR_MSG('gameEngine.Entity::cellCall: not fount interfaceName!');
                return;
            }

            if (this.cell == undefined) {
                gameEngine.ERROR_MSG('gameEngine.Entity::cellCall: cell is None!');
                return;
            }

            var method = gameEngine.moduledefs[this.className].cell_methods[arguments[0]];
            var methodID = method[0];
            var args = method[3];

            if (arguments.length - 1 != args.length) {
                gameEngine.ERROR_MSG("gameEngine.Entity::cellCall: args(" + (arguments.length - 1) + "!= " + args.length + ") size is error!");
                return;
            }

            this.cell.newMail();
            this.cell.bundle.writeUint16(methodID);

            try {
                for (var i = 0; i < args.length; i++) {
                    if (args[i].isSameType(arguments[i + 1])) {
                        args[i].addToStream(this.cell.bundle, arguments[i + 1]);
                    }
                    else {
                        throw new Error("gameEngine.Entity::cellCall: arg[" + i + "] is error!");
                    }
                }
            }
            catch (e) {
                gameEngine.ERROR_MSG(e.toString());
                gameEngine.ERROR_MSG('gameEngine.Entity::cellCall: args is error!');
                this.cell.bundle = null;
                return;
            }

            this.cell.postMail();
        },

        enterWorld: function () {
            gameEngine.INFO_MSG(this.className + '::enterWorld: ' + this.id);
            this.inWorld = true;
            this.onEnterWorld();

            gameEngine.Event.fire("onEnterWorld", this);
        },

        onEnterWorld: function () {
        },

        leaveWorld: function () {
            gameEngine.INFO_MSG(this.className + '::leaveWorld: ' + this.id);
            this.inWorld = false;
            this.onLeaveWorld();
            gameEngine.Event.fire("onLeaveWorld", this);
        },

        onLeaveWorld: function () {
        },

        enterSpace: function () {
            gameEngine.INFO_MSG(this.className + '::enterSpace: ' + this.id);
            this.onEnterSpace();
            gameEngine.Event.fire("onEnterSpace", this);
        },

        onEnterSpace: function () {
        },

        leaveSpace: function () {
            gameEngine.INFO_MSG(this.className + '::leaveSpace: ' + this.id);
            this.onLeaveSpace();
            gameEngine.Event.fire("onLeaveSpace", this);
        },

        onLeaveSpace: function () {
        },

        set_position: function (old) {
            // gameEngine.DEBUG_MSG(this.className + "::set_position: " + old);  

            if (this.isPlayer()) {
                gameEngine.app.entityServerPos.x = this.position.x;
                gameEngine.app.entityServerPos.y = this.position.y;
                gameEngine.app.entityServerPos.z = this.position.z;
            }

            gameEngine.Event.fire("set_position", this);
        },

        onUpdateVolatileData: function () {
        },

        set_direction: function (old) {
            // gameEngine.DEBUG_MSG(this.className + "::set_direction: " + old);  
            gameEngine.Event.fire("set_direction", this);
        }
    });

/*-----------------------------------------------------------------------------------------
 mailbox
 -----------------------------------------------------------------------------------------*/
gameEngine.MAILBOX_TYPE_CELL = 0;
gameEngine.MAILBOX_TYPE_BASE = 1;

gameEngine.Mailbox = function () {
    this.id = 0;
    this.className = "";
    this.type = gameEngine.MAILBOX_TYPE_CELL;
    this.networkInterface = gameEngine.app;

    this.bundle = null;

    this.isBase = function () {
        return this.type == gameEngine.MAILBOX_TYPE_BASE;
    }

    this.isCell = function () {
        return this.type == gameEngine.MAILBOX_TYPE_CELL;
    }

    this.newMail = function () {
        if (this.bundle == null)
            this.bundle = new gameEngine.Bundle();

        if (this.type == gameEngine.MAILBOX_TYPE_CELL)
            this.bundle.newMessage(gameEngine.messages.Baseapp_onRemoteCallCellMethodFromClient);
        else
            this.bundle.newMessage(gameEngine.messages.Base_onRemoteMethodCall);

        this.bundle.writeInt32(this.id);

        return this.bundle;
    }

    this.postMail = function (bundle) {
        if (bundle == undefined)
            bundle = this.bundle;

        bundle.send(this.networkInterface);

        if (this.bundle == bundle)
            this.bundle = null;
    }
}

/*-----------------------------------------------------------------------------------------
 entitydef
 -----------------------------------------------------------------------------------------*/
gameEngine.moduledefs = {};
gameEngine.datatypes = {};

gameEngine.DATATYPE_UINT8 = function () {
    this.bind = function () {
    }

    this.createFromStream = function (stream) {
        return gameEngine.reader.readUint8.call(stream);
    }

    this.addToStream = function (stream, v) {
        stream.writeUint8(v);
    }

    this.parseDefaultValStr = function (v) {
        return parseInt(v);
    }

    this.isSameType = function (v) {
        if (typeof(v) != "number") {
            return false;
        }

        if (v < 0 || v > 0xff) {
            return false;
        }

        return true;
    }
}

gameEngine.DATATYPE_UINT16 = function () {
    this.bind = function () {
    }

    this.createFromStream = function (stream) {
        return gameEngine.reader.readUint16.call(stream);
    }

    this.addToStream = function (stream, v) {
        stream.writeUint16(v);
    }

    this.parseDefaultValStr = function (v) {
        return parseInt(v);
    }

    this.isSameType = function (v) {
        if (typeof(v) != "number") {
            return false;
        }

        if (v < 0 || v > 0xffff) {
            return false;
        }

        return true;
    }
}

gameEngine.DATATYPE_UINT32 = function () {
    this.bind = function () {
    }

    this.createFromStream = function (stream) {
        return gameEngine.reader.readUint32.call(stream);
    }

    this.addToStream = function (stream, v) {
        stream.writeUint32(v);
    }

    this.parseDefaultValStr = function (v) {
        return parseInt(v);
    }

    this.isSameType = function (v) {
        if (typeof(v) != "number") {
            return false;
        }

        if (v < 0 || v > 0xffffffff) {
            return false;
        }

        return true;
    }
}

gameEngine.DATATYPE_UINT64 = function () {
    this.bind = function () {
    }

    this.createFromStream = function (stream) {
        return gameEngine.reader.readUint64.call(stream);
    }

    this.addToStream = function (stream, v) {
        stream.writeUint64(v);
    }

    this.parseDefaultValStr = function (v) {
        return parseInt(v);
    }

    this.isSameType = function (v) {
        return v instanceof gameEngine.UINT64;
    }
}

gameEngine.DATATYPE_INT8 = function () {
    this.bind = function () {
    }

    this.createFromStream = function (stream) {
        return gameEngine.reader.readInt8.call(stream);
    }

    this.addToStream = function (stream, v) {
        stream.writeInt8(v);
    }

    this.parseDefaultValStr = function (v) {
        return parseInt(v);
    }

    this.isSameType = function (v) {
        if (typeof(v) != "number") {
            return false;
        }

        if (v < -0x80 || v > 0x7f) {
            return false;
        }

        return true;
    }
}

gameEngine.DATATYPE_INT16 = function () {
    this.bind = function () {
    }

    this.createFromStream = function (stream) {
        return gameEngine.reader.readInt16.call(stream);
    }

    this.addToStream = function (stream, v) {
        stream.writeInt16(v);
    }

    this.parseDefaultValStr = function (v) {
        return parseInt(v);
    }

    this.isSameType = function (v) {
        if (typeof(v) != "number") {
            return false;
        }

        if (v < -0x8000 || v > 0x7fff) {
            return false;
        }

        return true;
    }
}

gameEngine.DATATYPE_INT32 = function () {
    this.bind = function () {
    }

    this.createFromStream = function (stream) {
        return gameEngine.reader.readInt32.call(stream);
    }

    this.addToStream = function (stream, v) {
        stream.writeInt32(v);
    }

    this.parseDefaultValStr = function (v) {
        return parseInt(v);
    }

    this.isSameType = function (v) {
        if (typeof(v) != "number") {
            return false;
        }

        if (v < -0x80000000 || v > 0x7fffffff) {
            return false;
        }

        return true;
    }
}

gameEngine.DATATYPE_INT64 = function () {
    this.bind = function () {
    }

    this.createFromStream = function (stream) {
        return gameEngine.reader.readInt64.call(stream);
    }

    this.addToStream = function (stream, v) {
        stream.writeInt64(v);
    }

    this.parseDefaultValStr = function (v) {
        return parseInt(v);
    }

    this.isSameType = function (v) {
        return v instanceof gameEngine.INT64;
    }
}

gameEngine.DATATYPE_FLOAT = function () {
    this.bind = function () {
    }

    this.createFromStream = function (stream) {
        return gameEngine.reader.readFloat.call(stream);
    }

    this.addToStream = function (stream, v) {
        stream.writeFloat(v);
    }

    this.parseDefaultValStr = function (v) {
        return parseFloat(v);
    }

    this.isSameType = function (v) {
        return typeof(v) == "number";
    }
}

gameEngine.DATATYPE_DOUBLE = function () {
    this.bind = function () {
    }

    this.createFromStream = function (stream) {
        return gameEngine.reader.readDouble.call(stream);
    }

    this.addToStream = function (stream, v) {
        stream.writeDouble(v);
    }

    this.parseDefaultValStr = function (v) {
        return parseFloat(v);
    }

    this.isSameType = function (v) {
        return typeof(v) == "number";
    }
}

gameEngine.DATATYPE_STRING = function () {
    this.bind = function () {
    }

    this.createFromStream = function (stream) {
        return gameEngine.reader.readString.call(stream);
    }

    this.addToStream = function (stream, v) {
        stream.writeString(v);
    }

    this.parseDefaultValStr = function (v) {
        if(typeof(v) == "string")
			return v;

		return "";
    }

    this.isSameType = function (v) {
        return typeof(v) == "string";
    }
}

gameEngine.DATATYPE_VECTOR = function (size) {
    this.itemsize = size;

    this.bind = function () {
    }

    this.createFromStream = function (stream) {

        var size = gameEngine.reader.readUint32.call(stream);
        if (size != this.itemsize) {
            gameEngine.ERROR_MSG("KBEDATATYPE_VECTOR::createFromStream: size(" + size + ") != thisSize(" + this.itemsize + ") !");
            return undefined;
        }

        if (this.itemsize == 3) {
            if (gameEngine.CLIENT_NO_FLOAT) {
                return new gameEngine.Vector3(gameEngine.reader.readInt32.call(stream),
                    gameEngine.reader.readInt32.call(stream), gameEngine.reader.readInt32.call(stream));
            }
            else {
                return new gameEngine.Vector3(gameEngine.reader.readFloat.call(stream),
                    gameEngine.reader.readFloat.call(stream), gameEngine.reader.readFloat.call(stream));
            }
        }
        else if (this.itemsize == 4) {
            if (gameEngine.CLIENT_NO_FLOAT) {
                return new gameEngine.Vector4(gameEngine.reader.readInt32.call(stream),
                    gameEngine.reader.readInt32.call(stream), gameEngine.reader.readInt32.call(stream));
            }
            else {
                return new gameEngine.Vector4(gameEngine.reader.readFloat.call(stream),
                    gameEngine.reader.readFloat.call(stream), gameEngine.reader.readFloat.call(stream));
            }
        }
        else if (this.itemsize == 2) {
            if (gameEngine.CLIENT_NO_FLOAT) {
                return new gameEngine.Vector2(gameEngine.reader.readInt32.call(stream),
                    gameEngine.reader.readInt32.call(stream), gameEngine.reader.readInt32.call(stream));
            }
            else {
                return new gameEngine.Vector2(gameEngine.reader.readFloat.call(stream),
                    gameEngine.reader.readFloat.call(stream), gameEngine.reader.readFloat.call(stream));
            }
        }

        return undefined;
    }

    this.addToStream = function (stream, v) {
        stream.writeUint32(this.itemsize);

        if (gameEngine.CLIENT_NO_FLOAT) {
            stream.writeInt32(v.x);
            stream.writeInt32(v.y);
        }
        else {
            stream.writeFloat(v.x);
            stream.writeFloat(v.y);
        }

        if (this.itemsize == 3) {
            if (gameEngine.CLIENT_NO_FLOAT) {
                stream.writeInt32(v.z);
            }
            else {
                stream.writeFloat(v.z);
            }
        }
        else if (this.itemsize == 4) {
            if (gameEngine.CLIENT_NO_FLOAT) {
                stream.writeInt32(v.z);
                stream.writeInt32(v.w);
            }
            else {
                stream.writeFloat(v.z);
                stream.writeFloat(v.w);
            }
        }
    }

    this.parseDefaultValStr = function (v) {
        if (this.itemsize == 2) {
            return new gameEngine.Vector2(0.0, 0.0);
        }
        else if (this.itemsize == 3) {
            return new gameEngine.Vector3(0.0, 0.0);
        }
        return new gameEngine.Vector2(0.0, 0.0);
    }

    this.isSameType = function (v) {
        if (this.itemsize == 2) {
            if (!v instanceof gameEngine.Vector2) {
                return false;
            }
        }
        else if (this.itemsize == 3) {
            if (!v instanceof gameEngine.Vector3) {
                return false;
            }
        }
        else if (this.itemsize == 4) {
            if (!v instanceof gameEngine.Vector4) {
                return false;
            }
        }

        return true;
    }
}

gameEngine.DATATYPE_PYTHON = function () {
    this.bind = function () {
    }

    this.createFromStream = function (stream) {
    }

    this.addToStream = function (stream, v) {
    }

    this.parseDefaultValStr = function (v) {
        return new Uint8Array();
    }

    this.isSameType = function (v) {
        return false;
    }
}

gameEngine.DATATYPE_UNICODE = function () {
    this.bind = function () {
    }

    this.createFromStream = function (stream) {
        return gameEngine.utf8ArrayToString(gameEngine.reader.readBlob.call(stream));
    }

    this.addToStream = function (stream, v) {
        stream.writeBlob(gameEngine.stringToUTF8Bytes(v));
    }

    this.parseDefaultValStr = function (v) {
        if (typeof(v) == "string")
            return v;

        return "";
    }

    this.isSameType = function (v) {
        return typeof(v) == "string";
    }
}

gameEngine.DATATYPE_MAILBOX = function () {
    this.bind = function () {
    }

    this.createFromStream = function (stream) {
    }

    this.addToStream = function (stream, v) {
    }

    this.parseDefaultValStr = function (v) {
        return new Uint8Array();
    }

    this.isSameType = function (v) {
        return false;
    }
}

gameEngine.DATATYPE_BLOB = function () {
    this.bind = function () {
    }

    this.createFromStream = function (stream) {
        var size = gameEngine.reader.readUint32.call(stream);
        var buf = new Uint8Array(stream.buffer, stream.rpos, size);
        stream.rpos += size;
        return buf;
    }

    this.addToStream = function (stream, v) {
        stream.writeBlob(v);
    }

    this.parseDefaultValStr = function (v) {
        return new Uint8Array();
    }

    this.isSameType = function (v) {
        return true;
    }
}

gameEngine.DATATYPE_ARRAY = function () {
    this.type = gameEngine.datatypes["UINT8"];

    this.bind = function () {
        if (typeof(this.type) == "number")
            this.type = gameEngine.datatypes[this.type];
    }

    this.createFromStream = function (stream) {
        var size = stream.readUint32();
        var datas = [];

        while (size > 0) {
            size--;
            datas.push(this.type.createFromStream(stream));
        };

        return datas;
    }

    this.addToStream = function (stream, v) {
        stream.writeUint32(v.length);
        for (var i = 0; i < v.length; i++) {
            this.type.addToStream(stream, v[i]);
        }
    }

    this.parseDefaultValStr = function (v) {
       return [];
    }

    this.isSameType = function (v) {
        for (var i = 0; i < v.length; i++) {
            if (!this.type.isSameType(v[i])) {
                return false;
            }
        }

        return true;
    }
}

gameEngine.DATATYPE_FIXED_DICT = function () {
    this.dicttype = {};
    this.implementedBy = null;

    this.bind = function () {
        for (var itemkey in this.dicttype) {
            var utype = this.dicttype[itemkey];

            if (typeof(this.dicttype[itemkey]) == "number")
                this.dicttype[itemkey] = gameEngine.datatypes[utype];
        }
    }

    this.createFromStream = function (stream) {
        var datas = {};
        for (var itemkey in this.dicttype) {
            datas[itemkey] = this.dicttype[itemkey].createFromStream(stream);
        }

        return datas;
    }

    this.addToStream = function (stream, v) {
        for (var itemkey in this.dicttype) {
            this.dicttype[itemkey].addToStream(stream, v[itemkey]);
        }
    }

    this.parseDefaultValStr = function (v) {
        return {};
    }

    this.isSameType = function (v) {
        for (var itemkey in this.dicttype) {
            if (!this.dicttype[itemkey].isSameType(v[itemkey])) {
                return false;
            }
        }

        return true;
    }
}

gameEngine.datatypes["UINT8"] = new gameEngine.DATATYPE_UINT8();
gameEngine.datatypes["UINT16"] = new gameEngine.DATATYPE_UINT16();
gameEngine.datatypes["UINT32"] = new gameEngine.DATATYPE_UINT32();
gameEngine.datatypes["UINT64"] = new gameEngine.DATATYPE_UINT64();

gameEngine.datatypes["INT8"] = new gameEngine.DATATYPE_INT8();
gameEngine.datatypes["INT16"] = new gameEngine.DATATYPE_INT16();
gameEngine.datatypes["INT32"] = new gameEngine.DATATYPE_INT32();
gameEngine.datatypes["INT64"] = new gameEngine.DATATYPE_INT64();

gameEngine.datatypes["FLOAT"] = new gameEngine.DATATYPE_FLOAT();
gameEngine.datatypes["DOUBLE"] = new gameEngine.DATATYPE_DOUBLE();

gameEngine.datatypes["STRING"] = new gameEngine.DATATYPE_STRING();
gameEngine.datatypes["VECTOR2"] = new gameEngine.DATATYPE_VECTOR(2);
gameEngine.datatypes["VECTOR3"] = new gameEngine.DATATYPE_VECTOR(3);
gameEngine.datatypes["VECTOR4"] = new gameEngine.DATATYPE_VECTOR(4);
gameEngine.datatypes["PYTHON"] = new gameEngine.DATATYPE_PYTHON();
gameEngine.datatypes["UNICODE"] = new gameEngine.DATATYPE_UNICODE();
gameEngine.datatypes["MAILBOX"] = new gameEngine.DATATYPE_MAILBOX();
gameEngine.datatypes["BLOB"] = new gameEngine.DATATYPE_BLOB();
gameEngine.datatypes["ARRAY"] = new gameEngine.DATATYPE_ARRAY();

/*-----------------------------------------------------------------------------------------
 gameEngine args
 -----------------------------------------------------------------------------------------*/
gameEngine.gameEngineArgs = function () {
    this.ip = "127.0.0.1";
    this.port = 20013;
    this.updateHZ = 100;

    // Reference: http://www.gameEngine.org/docs/programming/clientsdkprogramming.html, client types
    this.clientType = 1;

    // 在Entity初始化时是否触发属性的set_*事件(callPropertysSetMethods)
    this.isOnInitCallPropertysSetMethods = true;
}

/*-----------------------------------------------------------------------------------------
 gameEngine app
 -----------------------------------------------------------------------------------------*/
gameEngine.gameEngineApp = function (gameEngineArgs) {
    //console.assert(gameEngine.app == null || gameEngine.app == undefined, "Assertion of gameEngine.app not is null");

    gameEngine.app = this;

    this.args = gameEngineArgs;

    this.username = "testhtml51";
    this.password = "123456";
    this.clientdatas = "";
    this.encryptedKey = "";

    this.loginappMessageImported = false;
    this.baseappMessageImported = false;
    this.serverErrorsDescrImported = false;
    this.entitydefImported = false;


    // 描述服务端返回的错误信息
    gameEngine.ServerErr = function () {
        this.name = "";
        this.descr = "";
        this.id = 0;
    }

    this.serverErrs = {};

    // 登录loginapp的地址
    this.ip = this.args.ip;
    this.port = this.args.port;

    // 服务端分配的baseapp地址
    this.baseappIP = "";
    this.baseappPort = 0;
    
    this.Client_onAppActiveTickCB = function() {
        KKVS.INFO_MSG("recv heart msg");
    }

    this.reset = function () {
        if (this.entities != undefined && this.entities != null) {
            this.clearEntities(true);
        }
        try
        {
             if (this.socket != undefined && this.socket != null)
             {
                this.socket.onopen  = undefined;
                this.socket.onerror  = undefined;
                this.socket.onmessage  = undefined;
                this.socket.onclose = undefined;
                this.socket.close();
                this.socket = null;
             }
        }
        catch (e)
        {

        }


        this.currserver = "loginapp";
        this.currstate = "create";

        // 扩展数据
        this.serverdatas = "";

        // 版本信息
        this.serverVersion = "";
        this.serverScriptVersion = "";
        this.serverProtocolMD5 = "";
        this.serverEntityDefMD5 = "";
        this.clientVersion = "0.8.0";
        this.clientScriptVersion = "0.1.0";

        // player的相关信息
        this.entity_uuid = null;
        this.entity_id = 0;
        this.entity_type = "";

        // 当前玩家最后一次同步到服务端的位置与朝向与服务端最后一次同步过来的位置
        this.entityLastLocalPos = new gameEngine.Vector3(0.0, 0.0, 0.0);
        this.entityLastLocalDir = new gameEngine.Vector3(0.0, 0.0, 0.0);
        this.entityServerPos = new gameEngine.Vector3(0.0, 0.0, 0.0);

        // 玩家是否在地面上
        this.isOnGround = false;

        // 客户端所有的实体
        this.entities = {};
        this.entityIDAliasIDList = [];

        // 空间的信息
        this.spacedata = {};
        this.spaceID = 0;
        this.spaceResPath = "";
        this.isLoadedGeometry = false;

        var dateObject = new Date();
        this.lastticktime = dateObject.getTime();

        // 当前组件类别， 配套服务端体系
        this.component = "client";
    }

    this.installEvents = function () {
        gameEngine.Event.register("createAccount", this, "createAccount");
        gameEngine.Event.register("login", this, "login");
        gameEngine.Event.register("reLoginBaseapp", this, "reLoginBaseapp");
        gameEngine.Event.register("bindAccountEmail", this, "bindAccountEmail");
        gameEngine.Event.register("newPassword", this, "newPassword");
    }

    this.uninstallEvents = function () {
        gameEngine.Event.deregister("reLoginBaseapp", this);
        gameEngine.Event.deregister("login", this);
        gameEngine.Event.deregister("createAccount", this);
    }

    this.hello = function () {
        var bundle = new gameEngine.Bundle();

        if (gameEngine.app.currserver == "loginapp")
            bundle.newMessage(gameEngine.messages.Loginapp_hello);
        else
            bundle.newMessage(gameEngine.messages.Baseapp_hello);

        bundle.writeString(gameEngine.app.clientVersion);
        bundle.writeString(gameEngine.app.clientScriptVersion);
        bundle.writeBlob(gameEngine.app.encryptedKey);
        bundle.send(gameEngine.app);
    }

    this.player = function () {
        return gameEngine.app.entities[gameEngine.app.entity_id];
    }

    this.findEntity = function (entityID) {
        return gameEngine.app.entities[entityID];
    }

    this.connect = function (addr) {
        //console.assert(gameEngine.app.socket == null, "Assertion of socket not is null");

        try {
            gameEngine.app.socket = new WebSocket(addr);
        }
        catch (e) {
            gameEngine.ERROR_MSG('WebSocket init error!');
            gameEngine.Event.fire("onConnectStatus", false);
            return;
        }

        gameEngine.app.socket.binaryType = "arraybuffer";
        gameEngine.app.socket.onopen = gameEngine.app.onopen;
        gameEngine.app.socket.onerror = gameEngine.app.onerror_before_onopen;
        gameEngine.app.socket.onmessage = gameEngine.app.onmessage;
        gameEngine.app.socket.onclose = gameEngine.app.onclose;
    }

    this.disconnect = function () {
        try {
            if (gameEngine.app.socket != null) {
                gameEngine.app.socket.onclose = undefined;
                gameEngine.app.socket.close();
                gameEngine.app.socket = null;
            }
        }
        catch (e) {
        }
    }

    this.onopen = function () {
        gameEngine.INFO_MSG('connect success!');
        gameEngine.app.socket.onerror = gameEngine.app.onerror_after_onopen;
        gameEngine.Event.fire("onConnectStatus", true);
    }

    this.onerror_before_onopen = function (evt) {
        gameEngine.ERROR_MSG('connect error 1:' + evt.data);
        gameEngine.Event.fire("onConnectStatus", false);
    }

    this.onerror_after_onopen = function (evt) {
        gameEngine.ERROR_MSG('connect error 2:' + evt.data);
        gameEngine.Event.fire("onDisableConnect");
    }

    this.onmessage = function (msg) {
        var stream = new gameEngine.MemoryStream(msg.data);
        stream.wpos = msg.data.byteLength;

        while (stream.rpos < stream.wpos) {
            var msgid = stream.readUint16();
            var msgHandler = gameEngine.clientmessages[msgid];

            if (!msgHandler) {
                gameEngine.ERROR_MSG("gameEngineApp::onmessage[" + gameEngine.app.currserver + "]: not found msg(" + msgid + ")!");
            }
            else {
                var msglen = msgHandler.length;
                if (msglen == -1) {
                    msglen = stream.readUint16();

                    // 扩展长度
                    if (msglen == 65535)
                        msglen = stream.readUint32();
                }

                var wpos = stream.wpos;
                var rpos = stream.rpos + msglen;
                stream.wpos = rpos;
                msgHandler.handleMessage(stream);
                stream.wpos = wpos;
                stream.rpos = rpos;
            }
        }
    }

    this.onclose = function () {
        gameEngine.INFO_MSG('connect close:' + gameEngine.app.currserver);
        //if(gameEngine.app.currserver != "loginapp")
        gameEngine.app.reset();
        var args = {"disable_type": "lobby"}
        gameEngine.Event.fire("onDisableConnect", args);
    }

    this.send = function (msg) {
        KKVS.INFO_MSG("msg = " + msg);
        gameEngine.app.socket.send(msg);
    }

    this.close = function () {
        gameEngine.app.socket.close();
        gameEngine.app.reset();
    }

    this.update = function () {
        if (gameEngine.app.socket == null)
            return;

        var dateObject = new Date();
        if ((dateObject.getTime() - gameEngine.app.lastticktime) / 1000 > 15) {
            if (gameEngine.app.currserver == "loginapp") {
                if (gameEngine.messages.Loginapp_onClientActiveTick != undefined) {
                    var bundle = new gameEngine.Bundle();
                    bundle.newMessage(gameEngine.messages.Loginapp_onClientActiveTick);
                    bundle.send(gameEngine.app);
                }
            }
            else {
                if (gameEngine.messages.Baseapp_onClientActiveTick != undefined) {
                    var bundle = new gameEngine.Bundle();
                    bundle.newMessage(gameEngine.messages.Baseapp_onClientActiveTick);
                    bundle.send(gameEngine.app);
                }
            }

            gameEngine.app.lastticktime = dateObject.getTime();
        }

        gameEngine.app.updatePlayerToServer();
    }

    /*
     通过错误id得到错误描述
     */
    this.serverErr = function (id) {
        var e = gameEngine.app.serverErrs[id];

        if (e == undefined) {
            return "";
        }

        return e.name + " [" + e.descr + "]";
    }

    /*
     服务端错误描述导入了
     */
    this.Client_onImportServerErrorsDescr = function (stream) {
        var size = stream.readUint16();
        while (size > 0) {
            size -= 1;

            var e = new gameEngine.ServerErr();
            e.id = stream.readUint16();
            e.name = gameEngine.utf8ArrayToString(stream.readBlob());
            e.descr = gameEngine.utf8ArrayToString(stream.readBlob());

            gameEngine.app.serverErrs[e.id] = e;

            gameEngine.INFO_MSG("Client_onImportServerErrorsDescr: id=" + e.id + ", name=" + e.name + ", descr=" + e.descr);
        }
    }

    this.onOpenLoginapp_login = function () {
        gameEngine.INFO_MSG("gameEngineApp::onOpenLoginapp_login: successfully!");
        gameEngine.Event.fire("onConnectStatus", true);

        gameEngine.app.currserver = "loginapp";
        gameEngine.app.currstate = "login";

        if (!gameEngine.app.loginappMessageImported) {
            var bundle = new gameEngine.Bundle();
            bundle.newMessage(gameEngine.messages.Loginapp_importClientMessages);
            bundle.send(gameEngine.app);
            gameEngine.app.socket.onmessage = gameEngine.app.Client_onImportClientMessages;
            gameEngine.INFO_MSG("gameEngineApp::onOpenLoginapp_login: start importClientMessages ...");
            gameEngine.Event.fire("Loginapp_importClientMessages");
        }
        else {
            gameEngine.app.onImportClientMessagesCompleted();
        }
    }

    this.onOpenLoginapp_createAccount = function () {
        gameEngine.Event.fire("onConnectStatus", true);
        gameEngine.INFO_MSG("gameEngineApp::onOpenLoginapp_createAccount: successfully!");
        gameEngine.app.currserver = "loginapp";
        gameEngine.app.currstate = "createAccount";

        if (!gameEngine.app.loginappMessageImported) {
            var bundle = new gameEngine.Bundle();
            bundle.newMessage(gameEngine.messages.Loginapp_importClientMessages);
            bundle.send(gameEngine.app);
            gameEngine.app.socket.onmessage = gameEngine.app.Client_onImportClientMessages;
            gameEngine.INFO_MSG("gameEngineApp::onOpenLoginapp_createAccount: start importClientMessages ...");
            gameEngine.Event.fire("Loginapp_importClientMessages");
        }
        else {
            gameEngine.app.onImportClientMessagesCompleted();
        }
    }

    this.onImportClientMessagesCompleted = function () {
        gameEngine.INFO_MSG("gameEngineApp::onImportClientMessagesCompleted: successfully!");
        gameEngine.app.socket.onmessage = gameEngine.app.onmessage;
        gameEngine.app.hello();

        if (gameEngine.app.currserver == "loginapp") {
            if (!gameEngine.app.serverErrorsDescrImported) {
                // gameEngine.INFO_MSG("gameEngine::onImportClientMessagesCompleted(): send importServerErrorsDescr!");
                gameEngine.app.serverErrorsDescrImported = true;
                // var bundle = new gameEngine.Bundle();
                // bundle.newMessage(gameEngine.messages.Loginapp_importServerErrorsDescr);
                // bundle.send(gameEngine.app);
            }

            if (gameEngine.app.currstate == "login")
                gameEngine.app.login_loginapp(false);
            else if (gameEngine.app.currstate == "resetpassword")
                gameEngine.app.resetpassword_loginapp(false);
            else
                gameEngine.app.createAccount_loginapp(false);

            gameEngine.app.loginappMessageImported = true;
        }
        else {
            gameEngine.app.baseappMessageImported = true;

            if (!gameEngine.app.entitydefImported) {
                gameEngine.INFO_MSG("gameEngineApp::onImportClientMessagesCompleted: start importEntityDef ...");
                var bundle = new gameEngine.Bundle();
                bundle.newMessage(gameEngine.messages.Baseapp_importClientEntityDef);
                bundle.send(gameEngine.app);
                gameEngine.Event.fire("Baseapp_importClientEntityDef");
            }
            else {
                gameEngine.app.onImportEntityDefCompleted();
            }
        }
    }

    this.createDataTypeFromStreams = function (stream, canprint) {
        var aliassize = stream.readUint16();
        gameEngine.INFO_MSG("gameEngineApp::createDataTypeFromStreams: importAlias(size=" + aliassize + ")!");

        while (aliassize > 0) {
            aliassize--;
            gameEngine.app.createDataTypeFromStream(stream, canprint);
        }
        ;

        for (var datatype in gameEngine.datatypes) {
            if (gameEngine.datatypes[datatype] != undefined) {
                gameEngine.datatypes[datatype].bind();
            }
        }
    }

    this.createDataTypeFromStream = function (stream, canprint) {
        var utype = stream.readUint16();
        var name = stream.readString();
        var valname = stream.readString();

        /* 有一些匿名类型，我们需要提供一个唯一名称放到datatypes中
         如：
         <onRemoveAvatar>
         <Arg>	ARRAY <of> INT8 </of>		</Arg>
         </onRemoveAvatar>				
         */
        if (valname.length == 0)
            valname = "Null_" + utype;

        if (canprint)
            gameEngine.INFO_MSG("gameEngineApp::Client_onImportClientEntityDef: importAlias(" + name + ":" + valname + ")!");

        if (name == "FIXED_DICT") {
            var datatype = new gameEngine.DATATYPE_FIXED_DICT();
            var keysize = stream.readUint8();
            datatype.implementedBy = stream.readString();

            while (keysize > 0) {
                keysize--;

                var keyname = stream.readString();
                var keyutype = stream.readUint16();
                datatype.dicttype[keyname] = keyutype;
            }
            ;

            gameEngine.datatypes[valname] = datatype;
        }
        else if (name == "ARRAY") {
            var uitemtype = stream.readUint16();
            var datatype = new gameEngine.DATATYPE_ARRAY();
            datatype.type = uitemtype;
            gameEngine.datatypes[valname] = datatype;
        }
        else {
            gameEngine.datatypes[valname] = gameEngine.datatypes[name];
        }

        gameEngine.datatypes[utype] = gameEngine.datatypes[valname];

        // 将用户自定义的类型补充到映射表中
        gameEngine.datatype2id[valname] = utype;
    }

    this.Client_onImportClientEntityDef = function (stream) {
        gameEngine.app.createDataTypeFromStreams(stream, true);

        while (!stream.readEOF()) {
            var scriptmethod_name = stream.readString();
            var scriptUtype = stream.readUint16();
            var propertysize = stream.readUint16();
            var methodsize = stream.readUint16();
            var base_methodsize = stream.readUint16();
            var cell_methodsize = stream.readUint16();

            gameEngine.INFO_MSG("gameEngineApp::Client_onImportClientEntityDef: import(" + scriptmethod_name + "), propertys(" + propertysize + "), " +
                "clientMethods(" + methodsize + "), baseMethods(" + base_methodsize + "), cellMethods(" + cell_methodsize + ")!");

            gameEngine.moduledefs[scriptmethod_name] = {};
            var currModuleDefs = gameEngine.moduledefs[scriptmethod_name];
            currModuleDefs["name"] = scriptmethod_name;
            currModuleDefs["propertys"] = {};
            currModuleDefs["methods"] = {};
            currModuleDefs["base_methods"] = {};
            currModuleDefs["cell_methods"] = {};
            gameEngine.moduledefs[scriptUtype] = currModuleDefs;

            var self_propertys = currModuleDefs["propertys"];
            var self_methods = currModuleDefs["methods"];
            var self_base_methods = currModuleDefs["base_methods"];
            var self_cell_methods = currModuleDefs["cell_methods"];
            var Class = gameEngine[scriptmethod_name];
            while (propertysize > 0) {
                propertysize--;

                var properUtype = stream.readUint16();
                var properFlags = stream.readUint32();
                var aliasID = stream.readInt16();
                var name = stream.readString();
                var defaultValStr = stream.readString();
                var utype = gameEngine.datatypes[stream.readUint16()];
                var setmethod = null;
                if (Class != undefined) {
                    setmethod = Class.prototype["set_" + name];
                    if (setmethod == undefined)
                        setmethod = null;
                }

                var savedata = [properUtype, aliasID, name, defaultValStr, utype, setmethod, properFlags];
                self_propertys[name] = savedata;

                if (aliasID >= 0) {
                    self_propertys[aliasID] = savedata;
                    currModuleDefs["usePropertyDescrAlias"] = true;
                }
                else {
                    self_propertys[properUtype] = savedata;
                    currModuleDefs["usePropertyDescrAlias"] = false;
                }

                gameEngine.INFO_MSG("gameEngineApp::Client_onImportClientEntityDef: add(" + scriptmethod_name + "), property(" + name + "/" + properUtype + ").");
            }
            ;

            while (methodsize > 0) {
                methodsize--;

                var methodUtype = stream.readUint16();
                var aliasID = stream.readInt16();
                var name = stream.readString();
                var argssize = stream.readUint8();
                var args = [];

                while (argssize > 0) {
                    argssize--;
                    args.push(gameEngine.datatypes[stream.readUint16()]);
                }
                ;

                var savedata = [methodUtype, aliasID, name, args];
                self_methods[name] = savedata;

                if (aliasID >= 0) {
                    self_methods[aliasID] = savedata;
                    currModuleDefs["useMethodDescrAlias"] = true;
                }
                else {
                    self_methods[methodUtype] = savedata;
                    currModuleDefs["useMethodDescrAlias"] = false;
                }

                gameEngine.INFO_MSG("gameEngineApp::Client_onImportClientEntityDef: add(" + scriptmethod_name + "), method(" + name + ").");
            }
            ;

            while (base_methodsize > 0) {
                base_methodsize--;

                var methodUtype = stream.readUint16();
                var aliasID = stream.readInt16();
                var name = stream.readString();
                var argssize = stream.readUint8();
                var args = [];

                while (argssize > 0) {
                    argssize--;
                    args.push(gameEngine.datatypes[stream.readUint16()]);
                }
                ;

                self_base_methods[name] = [methodUtype, aliasID, name, args];
                gameEngine.INFO_MSG("gameEngineApp::Client_onImportClientEntityDef: add(" + scriptmethod_name + "), base_method(" + name + ").");
            }
            ;

            while (cell_methodsize > 0) {
                cell_methodsize--;

                var methodUtype = stream.readUint16();
                var aliasID = stream.readInt16();
                var name = stream.readString();
                var argssize = stream.readUint8();
                var args = [];

                while (argssize > 0) {
                    argssize--;
                    args.push(gameEngine.datatypes[stream.readUint16()]);
                }
                ;

                self_cell_methods[name] = [methodUtype, aliasID, name, args];
                gameEngine.INFO_MSG("gameEngineApp::Client_onImportClientEntityDef: add(" + scriptmethod_name + "), cell_method(" + name + ").");
            }
            ;
            var defmethod = gameEngine[scriptmethod_name];
            for (var name in currModuleDefs.propertys) {
                var infos = currModuleDefs.propertys[name];
                var properUtype = infos[0];
                var aliasID = infos[1];
                var name = infos[2];
                var defaultValStr = infos[3];
                var utype = infos[4];

                if (defmethod != undefined)
                    defmethod.prototype[name] = utype.parseDefaultValStr(defaultValStr);
            };

            for (var name in currModuleDefs.methods) {
                var infos = currModuleDefs.methods[name];
                var properUtype = infos[0];
                var aliasID = infos[1];
                var name = infos[2];
                var args = infos[3];

                if (defmethod != undefined && defmethod.prototype[name] == undefined) {
                    gameEngine.WARNING_MSG(scriptmethod_name + ":: method(" + name + ") no implement!");
                }
            }
            ;
        }

        gameEngine.app.onImportEntityDefCompleted();
    }

    this.Client_onVersionNotMatch = function (stream) {
        this.serverVersion = stream.readString();
        gameEngine.ERROR_MSG("Client_onVersionNotMatch: verInfo=" + gameEngine.app.clientVersion + " not match(server: " + gameEngine.app.serverVersion + ")");
        gameEngine.Event.fire("onVersionNotMatch", this.clientVersion, this.serverVersion);
    }

    this.Client_onScriptVersionNotMatch = function (stream) {
        this.serverScriptVersion = stream.readString();
        gameEngine.ERROR_MSG("Client_onScriptVersionNotMatch: verInfo=" + gameEngine.app.clientScriptVersion + " not match(server: " + gameEngine.app.serverScriptVersion + ")");
        gameEngine.Event.fire("onScriptVersionNotMatch", this.clientScriptVersion, this.serverScriptVersion);
    }

    this.onImportEntityDefCompleted = function () {
        gameEngine.INFO_MSG("gameEngineApp::onImportEntityDefCompleted: successfully!");
        gameEngine.app.entitydefImported = true;
        gameEngine.app.login_baseapp(false);
    }

    this.Client_onImportClientMessages = function (msg) {
        var stream = new gameEngine.MemoryStream(msg.data);
        var msgid = stream.readUint16();

        if (msgid == gameEngine.messages.onImportClientMessages.id) {
            var msglen = stream.readUint16();
            var msgcount = stream.readUint16();

            gameEngine.INFO_MSG("gameEngineApp::onImportClientMessages: start(" + msgcount + ") ...!");

            while (msgcount > 0) {
                msgcount--;

                msgid = stream.readUint16();
                msglen = stream.readInt16();
                var msgname = stream.readString();
                var argtype = stream.readInt8();
                var argsize = stream.readUint8();
                var argstypes = new Array(argsize);

                for (var i = 0; i < argsize; i++) {
                    argstypes[i] = stream.readUint8();
                }

                var handler = null;
                var isClientMethod = msgname.indexOf("Client_") >= 0;
                if (isClientMethod) {
                    handler = gameEngine.app[msgname];
                    if (handler == null || handler == undefined) {
                        gameEngine.WARNING_MSG("gameEngineApp::onImportClientMessages[" + gameEngine.app.currserver + "]: interface(" + msgname + "/" + msgid + ") no implement!");
                        handler = null;
                    }
                    else {
                        gameEngine.INFO_MSG("gameEngineApp::onImportClientMessages: import(" + msgname + ") successfully!");
                    }
                }

                if (msgname.length > 0) {
                    gameEngine.messages[msgname] = new gameEngine.Message(msgid, msgname, msglen, argtype, argstypes, handler);

                    if (isClientMethod)
                        gameEngine.clientmessages[msgid] = gameEngine.messages[msgname];
                    else
                        gameEngine.messages[gameEngine.app.currserver][msgid] = gameEngine.messages[msgname];
                }
                else {
                    gameEngine.messages[gameEngine.app.currserver][msgid] = new gameEngine.Message(msgid, msgname, msglen, argtype, argstypes, handler);
                }
            }
            ;

            gameEngine.app.onImportClientMessagesCompleted();
        }
        else
            gameEngine.ERROR_MSG("gameEngineApp::onmessage: not found msg(" + msgid + ")!");
    }

    this.createAccount = function (username, password, datas) {
        gameEngine.app.username = username;
        gameEngine.app.password = password;
        gameEngine.app.clientdatas = datas;

        gameEngine.app.createAccount_loginapp(true);
    }

    this.createAccount_loginapp = function (noconnect) {
        if (noconnect) {
            // gameEngine.INFO_MSG("gameEngineApp::createAccount_loginapp: start connect to ws://" + gameEngine.app.ip + ":" + gameEngine.app.port + "!");
            gameEngine.INFO_MSG("gameEngineApp::createAccount_loginapp: start connect to wss://" + gameEngine.app.ip + ":" + gameEngine.app.port + "!");
            gameEngine.app.connect(WSSTR + gameEngine.app.ip + ":" + gameEngine.app.port);
            gameEngine.app.socket.onopen = gameEngine.app.onOpenLoginapp_createAccount;
        }
        else {
            var bundle = new gameEngine.Bundle();
            bundle.newMessage(gameEngine.messages.Loginapp_reqCreateAccount);
            bundle.writeString(gameEngine.app.username);
            bundle.writeString(gameEngine.app.password);
            bundle.writeBlob(gameEngine.app.clientdatas);
            bundle.send(gameEngine.app);
        }
    }

    this.bindAccountEmail = function (emailAddress) {
        var bundle = new gameEngine.Bundle();
        bundle.newMessage(gameEngine.messages.Baseapp_reqAccountBindEmail);
        bundle.writeInt32(gameEngine.app.entity_id);
        bundle.writeString(gameEngine.app.password);
        bundle.writeString(emailAddress);
        bundle.send(gameEngine.app);
    }

    this.newPassword = function (old_password, new_password) {
        var bundle = new gameEngine.Bundle();
        bundle.newMessage(gameEngine.messages.Baseapp_reqAccountNewPassword);
        bundle.writeInt32(gameEngine.app.entity_id);
        bundle.writeString(old_password);
        bundle.writeString(new_password);
        bundle.send(gameEngine.app);
    }

    this.login = function (username, password, datas) {
        gameEngine.app.username = username;
        gameEngine.app.password = password;
        gameEngine.app.clientdatas = datas;

        gameEngine.app.login_loginapp(true);
    }

    this.login_loginapp = function (noconnect) {
        if (noconnect) {
            // gameEngine.INFO_MSG("gameEngineApp::login_loginapp: start connect to ws://" + gameEngine.app.ip + ":" + gameEngine.app.port + "!");
            gameEngine.INFO_MSG("gameEngineApp::login_loginapp: start connect to wss://" + gameEngine.app.ip + ":" + gameEngine.app.port + "!");
            gameEngine.app.connect(WSSTR + gameEngine.app.ip + ":" + gameEngine.app.port);
            gameEngine.app.socket.onopen = gameEngine.app.onOpenLoginapp_login;
        }
        else {
            var bundle = new gameEngine.Bundle();
            bundle.newMessage(gameEngine.messages.Loginapp_login);
            bundle.writeInt8(gameEngine.app.args.clientType); // clientType
            bundle.writeBlob(gameEngine.app.clientdatas);
            bundle.writeString(gameEngine.app.username);
            bundle.writeString(gameEngine.app.password);
            bundle.send(gameEngine.app);
        }
    }

    this.onOpenLoginapp_resetpassword = function () {
        gameEngine.INFO_MSG("gameEngineApp::onOpenLoginapp_resetpassword: successfully!");
        gameEngine.app.currserver = "loginapp";
        gameEngine.app.currstate = "resetpassword";

        if (!gameEngine.app.loginappMessageImported) {
            var bundle = new gameEngine.Bundle();
            bundle.newMessage(gameEngine.messages.Loginapp_importClientMessages);
            bundle.send(gameEngine.app);
            gameEngine.app.socket.onmessage = gameEngine.app.Client_onImportClientMessages;
            gameEngine.INFO_MSG("gameEngineApp::onOpenLoginapp_resetpassword: start importClientMessages ...");
        }
        else {
            gameEngine.app.onImportClientMessagesCompleted();
        }
    }

    this.reset_password = function (username) {
        gameEngine.app.username = username;
        gameEngine.app.resetpassword_loginapp(true);
    }

    this.resetpassword_loginapp = function (noconnect) {
        if (noconnect) {
            // gameEngine.INFO_MSG("gameEngineApp::createAccount_loginapp: start connect to ws://" + gameEngine.app.ip + ":" + gameEngine.app.port + "!");
            gameEngine.INFO_MSG("gameEngineApp::createAccount_loginapp: start connect to wss://" + gameEngine.app.ip + ":" + gameEngine.app.port + "!");
            gameEngine.app.connect(WSSTR + gameEngine.app.ip + ":" + gameEngine.app.port);
            gameEngine.app.socket.onopen = gameEngine.app.onOpenLoginapp_resetpassword;
        }
        else {
            var bundle = new gameEngine.Bundle();
            bundle.newMessage(gameEngine.messages.Loginapp_reqAccountResetPassword);
            bundle.writeString(gameEngine.app.username);
            bundle.send(gameEngine.app);
        }
    }

    this.onOpenBaseapp = function () {
        gameEngine.INFO_MSG("gameEngineApp::onOpenBaseapp: successfully!");
        gameEngine.app.currserver = "baseapp";

        if (!gameEngine.app.baseappMessageImported) {
            var bundle = new gameEngine.Bundle();
            bundle.newMessage(gameEngine.messages.Baseapp_importClientMessages);
            bundle.send(gameEngine.app);
            gameEngine.app.socket.onmessage = gameEngine.app.Client_onImportClientMessages;
            gameEngine.Event.fire("Baseapp_importClientMessages");
        }
        else {
            gameEngine.app.onImportClientMessagesCompleted();
        }
    }

    this.login_baseapp = function (noconnect) {
        if (noconnect) {
            gameEngine.Event.fire("onLoginBaseapp");
            // gameEngine.INFO_MSG("gameEngineApp::login_baseapp: start connect to ws://" + gameEngine.app.baseappIp + ":" + gameEngine.app.baseappPort + "!");
            gameEngine.INFO_MSG("gameEngineApp::login_baseapp: start connect to wss://" + gameEngine.app.baseappIp + ":" + gameEngine.app.baseappPort + "!");
            gameEngine.app.connect(WSSTR + gameEngine.app.baseappIp + ":" + gameEngine.app.baseappPort);
            gameEngine.app.socket.onopen = gameEngine.app.onOpenBaseapp;
        }
        else {
            var bundle = new gameEngine.Bundle();
            bundle.newMessage(gameEngine.messages.Baseapp_loginBaseapp);
            bundle.writeString(gameEngine.app.username);
            bundle.writeString(gameEngine.app.password);
            bundle.send(gameEngine.app);
        }
    }

    this.reLoginBaseapp = function () {
        gameEngine.Event.fire("onReLoginBaseapp");
        // gameEngine.INFO_MSG("gameEngineApp::reLoginBaseapp: start connect to ws://" + gameEngine.app.baseappIp + ":" + gameEngine.app.baseappPort + "!");
        gameEngine.INFO_MSG("gameEngineApp::reLoginBaseapp: start connect to wss://" + gameEngine.app.baseappIp + ":" + gameEngine.app.baseappPort + "!");
        gameEngine.app.connect(WSSTR + gameEngine.app.baseappIp + ":" + gameEngine.app.baseappPort);
        gameEngine.app.socket.onopen = gameEngine.app.onReOpenBaseapp;
    }

    this.onReOpenBaseapp = function () {
        gameEngine.INFO_MSG("gameEngineApp::onReOpenBaseapp: successfully!");
        gameEngine.app.currserver = "baseapp";

        var bundle = new gameEngine.Bundle();
        bundle.newMessage(gameEngine.messages.Baseapp_reLoginBaseapp);
        bundle.writeString(gameEngine.app.username);
        bundle.writeString(gameEngine.app.password);
        bundle.writeUint64(gameEngine.app.entity_uuid);
        bundle.writeInt32(gameEngine.app.entity_id);
        bundle.send(gameEngine.app);
    }

    this.Client_onHelloCB = function (args) {
        gameEngine.app.serverVersion = args.readString();
        gameEngine.app.serverScriptVersion = args.readString();
        gameEngine.app.serverProtocolMD5 = args.readString();
        gameEngine.app.serverEntityDefMD5 = args.readString();

        var ctype = args.readInt32();

        gameEngine.INFO_MSG("gameEngineApp::Client_onHelloCB: verInfo(" + gameEngine.app.serverVersion + "), scriptVerInfo(" +
            gameEngine.app.serverScriptVersion + "), serverProtocolMD5(" + gameEngine.app.serverProtocolMD5 + "), serverEntityDefMD5(" +
            gameEngine.app.serverEntityDefMD5 + "), ctype(" + ctype + ")!");
    }

    this.Client_onLoginFailed = function (args) {
        var failedcode = args.readUint16();
        gameEngine.app.serverdatas = args.readBlob();
        var descr = "";
        if(24 < failedcode) {
            descr = gameEngine.utf8ArrayToString(gameEngine.app.serverdatas);
        }
        // }else {
        //     descr = gameEngine.app.serverErrs[failedcode].descr;
        // }
        // gameEngine.ERROR_MSG("gameEngineApp::Client_onLoginFailed: failedcode(" + gameEngine.app.serverErrs[failedcode].name + "), datas(" + descr + ")!");
        var datas = {"msg_type": "lobby", "err_type": "loginfailed", "errcode": failedcode, "errtxt": descr};
        gameEngine.Event.fire("onLoginFailed", datas);
    }

    this.Client_onLoginSuccessfully = function (args) {
        var accountName = args.readString();
        gameEngine.app.username = accountName;
        gameEngine.app.baseappIp = args.readString();
        gameEngine.app.baseappPort = args.readUint16();
        if (WSSTR == "wss://") {
            gameEngine.app.baseappIp = "testsgame.kkvs.com";
            gameEngine.app.baseappPort = gameEngine.app.baseappPort - 100;
        }
        gameEngine.app.serverdatas = args.readBlob();

        gameEngine.INFO_MSG("gameEngineApp::Client_onLoginSuccessfully: accountName(" + accountName + "), addr(" +
            gameEngine.app.baseappIp + ":" + gameEngine.app.baseappPort + "), datas(" + gameEngine.app.serverdatas.length + ")!");

        gameEngine.app.disconnect();
        gameEngine.app.login_baseapp(true);
    }

    this.Client_onLoginBaseappFailed = function (failedcode) {
        //gameEngine.ERROR_MSG("gameEngineApp::Client_onLoginBaseappFailed: failedcode(" + gameEngine.app.serverErrs[failedcode].name + ")!");
        var datas = {"msg_type": "lobby", "err_type": "basefailed", "errcode": failedcode, "errtxt": ""};
        gameEngine.Event.fire("onLoginBaseappFailed", datas);
    }

    this.Client_onReLoginBaseappSuccessfully = function (stream) {
        gameEngine.app.entity_uuid = stream.readUint64();
        gameEngine.ERROR_MSG("gameEngineApp::Client_onReLoginBaseappSuccessfully: " + gameEngine.app.username);
        gameEngine.Event.fire("onReLoginBaseappSuccessfully");
    }

    this.entityclass = {};
    this.getentityclass = function (entityType) {
        var runclass = gameEngine.app.entityclass[entityType];
        if (runclass == undefined) {
            runclass = gameEngine[entityType];
            if (runclass == undefined) {
                gameEngine.ERROR_MSG("gameEngineApp::getentityclass: entityType(" + entityType + ") is error!");
                return runclass;
            }
            else
                gameEngine.app.entityclass[entityType] = runclass;
        }

        return runclass;
    }

    this.Client_onCreatedProxies = function (rndUUID, eid, entityType) {
        gameEngine.INFO_MSG("gameEngineApp::Client_onCreatedProxies: eid(" + eid + "), entityType(" + entityType + ")!");

        var entity = gameEngine.app.entities[eid];

        if (entity != undefined) {
            // gameEngine.WARNING_MSG("gameEngineApp::Client_onCreatedProxies: entity(" + eid + ") has exist!");
            return;
        }

        gameEngine.app.entity_uuid = rndUUID;
        gameEngine.app.entity_id = eid;

        var runclass = gameEngine.app.getentityclass(entityType);
        if (runclass == undefined)
            return;

        var entity = new runclass();
        entity.id = eid;
        entity.className = entityType;

        entity.base = new gameEngine.Mailbox();
        entity.base.id = eid;
        entity.base.className = entityType;
        entity.base.type = gameEngine.MAILBOX_TYPE_BASE;

        gameEngine.app.entities[eid] = entity;

        var entityMessage = gameEngine.bufferedCreateEntityMessage[eid];
        if (entityMessage != undefined) {
            gameEngine.app.Client_onUpdatePropertys(entityMessage);
            delete gameEngine.bufferedCreateEntityMessage[eid];
        }

        entity.__init__();
        entity.inited = true;

        if (this.args.isOnInitCallPropertysSetMethods)
            entity.callPropertysSetMethods();
    }

    this.getAoiEntityIDFromStream = function (stream) {
        var id = 0;
        if (gameEngine.app.entityIDAliasIDList.Length > 255) {
            id = stream.readInt32();
        }
        else {
            id = gameEngine.app.entityIDAliasIDList[stream.readUint8()];
        }

        // 如果为0且客户端上一步是重登陆或者重连操作并且服务端entity在断线期间一直处于在线状态
        // 则可以忽略这个错误, 因为cellapp可能一直在向baseapp发送同步消息， 当客户端重连上时未等
        // 服务端初始化步骤开始则收到同步信息, 此时这里就会出错。
        if (gameEngine.app.entityIDAliasIDList.length == 0)
            return 0;

        return id;
    }

    this.onUpdatePropertys_ = function (eid, stream) {
        var entity = gameEngine.app.entities[eid];

        if (entity == undefined) {
            var entityMessage = gameEngine.bufferedCreateEntityMessage[eid];
            if (entityMessage != undefined) {
                gameEngine.ERROR_MSG("gameEngineApp::Client_onUpdatePropertys: entity(" + eid + ") not found!");
                return;
            }

            var stream1 = new gameEngine.MemoryStream(stream.buffer);
            stream1.wpos = stream.wpos;
            stream1.rpos = stream.rpos - 4;
            gameEngine.bufferedCreateEntityMessage[eid] = stream1;
            return;
        }

        var currModule = gameEngine.moduledefs[entity.className];
        var pdatas = currModule.propertys;
        while (stream.length() > 0) {
            var utype = 0;
            if (currModule.usePropertyDescrAlias)
                utype = stream.readUint8();
            else
                utype = stream.readUint16();

            var propertydata = pdatas[utype];
            var setmethod = propertydata[5];
            var flags = propertydata[6];
            var val = propertydata[4].createFromStream(stream);
            var oldval = entity[utype];

            gameEngine.INFO_MSG("gameEngineApp::Client_onUpdatePropertys: " + entity.className + "(id=" + eid + " " + propertydata[2] + ", val=" + val + ")!");

            entity[propertydata[2]] = val;
            if (setmethod != null) {
                // base类属性或者进入世界后cell类属性会触发set_*方法
                if (flags == 0x00000020 || flags == 0x00000040) {
                    if (entity.inited)
                        setmethod.apply(entity, oldval);
                }
                else {
                    if (entity.inWorld)
                        setmethod.apply(entity, oldval);
                }
            }
        }
    }

    this.Client_onUpdatePropertysOptimized = function (stream) {
        var eid = gameEngine.app.getAoiEntityIDFromStream(stream);
        gameEngine.app.onUpdatePropertys_(eid, stream);
    }

    this.Client_onUpdatePropertys = function (stream) {
        var eid = stream.readInt32();
        gameEngine.app.onUpdatePropertys_(eid, stream);
    }

    this.onRemoteMethodCall_ = function (eid, stream) {
        var entity = gameEngine.app.entities[eid];

        if (entity == undefined) {
            gameEngine.ERROR_MSG("gameEngineApp::Client_onRemoteMethodCall: entity(" + eid + ") not found!");
            return;
        }

        var methodUtype = 0;
        if (gameEngine.moduledefs[entity.className].useMethodDescrAlias)
            methodUtype = stream.readUint8();
        else
            methodUtype = stream.readUint16();

        var methoddata = gameEngine.moduledefs[entity.className].methods[methodUtype];
        var args = [];
        var argsdata = methoddata[3];
        var pos = stream.rpos;
        for (var i = 0; i < argsdata.length; i++) {
            args.push(argsdata[i].createFromStream(stream));
        }
        
        var methodname = methoddata[2];
        if (entity[methoddata[2]] != undefined) {
            // switch (methodname) {
            //     case "onReConnectGameTable":
            //     case "onLobbyList":
            //     case "onEnterLobby":
            //     case "onRoomList":
            //     case "onRoomDataChanged":
            //     case "onSay":
            //     case "on_player_game_money_update":
            //     case "on_game_money_update":
            //     case "onPlayerData":
            //     case "onEnterRoomResult":
            //     case "onPlayerEnterRoom":
            //     case "onPlayerLeaveRoom":
            //     case "onPlayersInRoom":
            //     case "onRoomConfig":
            //     case "onEnterTable":
            //     case "onEnterTableResult":
            //     case "onLeaveTable":
            //     case "on_sign_record":
            //     case "on_sign_result":
            //     case "on_turntable_record":
            //     case "on_turntable_result":
            //     case "onTableStatus": {
            //         entity[methoddata[2]].apply(entity, args);
            //         break;
            //     }
                
            //     default: {
            //         stream.rpos = pos;
            //         entity["onGameMessage"](methodname, args, argsdata);
            //         break;
            //     }
            // }
            entity[methoddata[2]].apply(entity, args);
        }
        else {
             gameEngine.ERROR_MSG("gameEngineApp::Client_onRemoteMethodCall: entity(" + eid + ") not found method(" + methoddata[2] + ")!");
            //stream.rpos = pos;
            //entity["onGameMessage"](methodname, args, argsdata);
        }
    }

    this.Client_onRemoteMethodCallOptimized = function (stream) {
        var eid = gameEngine.app.getAoiEntityIDFromStream(stream);
        gameEngine.app.onRemoteMethodCall_(eid, stream);
    }

    this.Client_onRemoteMethodCall = function (stream) {
        var eid = stream.readInt32();
        gameEngine.app.onRemoteMethodCall_(eid, stream);
    }

    this.Client_onEntityEnterWorld = function (stream) {
        var eid = stream.readInt32();
        if (gameEngine.app.entity_id > 0 && eid != gameEngine.app.entity_id)
            gameEngine.app.entityIDAliasIDList.push(eid)

        var entityType;
        if (gameEngine.moduledefs.Length > 255)
            entityType = stream.readUint16();
        else
            entityType = stream.readUint8();

        var isOnGround = true;

        if (stream.length() > 0)
            isOnGround = stream.readInt8();

        entityType = gameEngine.moduledefs[entityType].name;
        gameEngine.INFO_MSG("gameEngineApp::Client_onEntityEnterWorld: " + entityType + "(" + eid + "), spaceID(" + gameEngine.app.spaceID + "), isOnGround(" + isOnGround + ")!");

        var entity = gameEngine.app.entities[eid];
        if (entity == undefined) {
            entityMessage = gameEngine.bufferedCreateEntityMessage[eid];
            if (entityMessage == undefined) {
                gameEngine.ERROR_MSG("gameEngineApp::Client_onEntityEnterWorld: entity(" + eid + ") not found!");
                return;
            }

            var runclass = gameEngine.app.getentityclass(entityType);
            if (runclass == undefined)
                return;

            var entity = new runclass();
            entity.id = eid;
            entity.className = entityType;

            entity.cell = new gameEngine.Mailbox();
            entity.cell.id = eid;
            entity.cell.className = entityType;
            entity.cell.type = gameEngine.MAILBOX_TYPE_CELL;

            gameEngine.app.entities[eid] = entity;

            gameEngine.app.Client_onUpdatePropertys(entityMessage);
            delete gameEngine.bufferedCreateEntityMessage[eid];

            entity.isOnGround = isOnGround > 0;
            entity.__init__();
            entity.inited = true;
            entity.inWorld = true;
            entity.enterWorld();

            if (this.args.isOnInitCallPropertysSetMethods)
                entity.callPropertysSetMethods();

            entity.set_direction(entity.direction);
            entity.set_position(entity.position);
        }
        else {
            if (!entity.inWorld) {
                entity.cell = new gameEngine.Mailbox();
                entity.cell.id = eid;
                entity.cell.className = entityType;
                entity.cell.type = gameEngine.MAILBOX_TYPE_CELL;

                // 安全起见， 这里清空一下
                // 如果服务端上使用giveClientTo切换控制权
                // 之前的实体已经进入世界， 切换后的实体也进入世界， 这里可能会残留之前那个实体进入世界的信息
                gameEngine.app.entityIDAliasIDList = [];
                gameEngine.app.entities = {}
                gameEngine.app.entities[entity.id] = entity;

                entity.set_direction(entity.direction);
                entity.set_position(entity.position);

                gameEngine.app.entityServerPos.x = entity.position.x;
                gameEngine.app.entityServerPos.y = entity.position.y;
                gameEngine.app.entityServerPos.z = entity.position.z;

                entity.isOnGround = isOnGround > 0;
                entity.inWorld = true;
                entity.enterWorld();

                if (this.args.isOnInitCallPropertysSetMethods)
                    entity.callPropertysSetMethods();
            }
        }
    }

    this.Client_onEntityLeaveWorldOptimized = function (stream) {
        var eid = gameEngine.app.getAoiEntityIDFromStream(stream);
        gameEngine.app.Client_onEntityLeaveWorld(eid);
    }

    this.Client_onEntityLeaveWorld = function (eid) {
        var entity = gameEngine.app.entities[eid];
        if (entity == undefined) {
            gameEngine.ERROR_MSG("gameEngineApp::Client_onEntityLeaveWorld: entity(" + eid + ") not found!");
            return;
        }

        if (entity.inWorld)
            entity.leaveWorld();

        if (gameEngine.app.entity_id > 0 && eid != gameEngine.app.entity_id) {
            delete gameEngine.app.entities[eid];

            var newArray = [];
            for (var i = 0; i < gameEngine.app.entityIDAliasIDList.length; i++) {
                if (gameEngine.app.entityIDAliasIDList[i] != eid) {
                    newArray.push(gameEngine.app.entityIDAliasIDList[i]);
                }
            }

            gameEngine.app.entityIDAliasIDList = newArray
        }
        else {
            gameEngine.app.clearSpace(false);
            entity.cell = null;
        }
    }

    this.Client_onEntityDestroyed = function (eid) {
        gameEngine.INFO_MSG("gameEngineApp::Client_onEntityDestroyed: entity(" + eid + ")!");

        var entity = gameEngine.app.entities[eid];
        if (entity == undefined) {
            gameEngine.ERROR_MSG("gameEngineApp::Client_onEntityDestroyed: entity(" + eid + ") not found!");
            return;
        }

        if (entity.inWorld) {
            if (gameEngine.app.entity_id == eid)
                gameEngine.app.clearSpace(false);

            entity.leaveWorld();
        }

        delete gameEngine.app.entities[eid];
    }

    this.Client_onEntityEnterSpace = function (stream) {
        var eid = stream.readInt32();
        gameEngine.app.spaceID = stream.readUint32();
        var isOnGround = true;

        if (stream.length() > 0)
            isOnGround = stream.readInt8();

        var entity = gameEngine.app.entities[eid];
        if (entity == undefined) {
            gameEngine.ERROR_MSG("gameEngineApp::Client_onEntityEnterSpace: entity(" + eid + ") not found!");
            return;
        }

        gameEngine.app.entityServerPos.x = entity.position.x;
        gameEngine.app.entityServerPos.y = entity.position.y;
        gameEngine.app.entityServerPos.z = entity.position.z;
        entity.enterSpace();
    }

    this.Client_onEntityLeaveSpace = function (eid) {
        var entity = gameEngine.app.entities[eid];
        if (entity == undefined) {
            gameEngine.ERROR_MSG("gameEngineApp::Client_onEntityLeaveSpace: entity(" + eid + ") not found!");
            return;
        }

        gameEngine.app.clearSpace(false);
        entity.leaveSpace();
    }

    this.Client_onKicked = function (failedcode) {
        // gameEngine.ERROR_MSG("gameEngineApp::Client_onKicked: failedcode(" + gameEngine.app.serverErrs[failedcode].name + ")!");
        var datas = {"msg_type": "lobby", "err_type": "kicked", "errcode": failedcode, "errtxt": ""};
        gameEngine.Event.fire("onKicked", datas);
    }

    this.Client_onCreateAccountResult = function (stream) {
        var retcode = stream.readUint16();
        var datas = stream.readBlob();

        if (retcode != 0) {
            gameEngine.ERROR_MSG("gameEngineApp::Client_onCreateAccountResult: " + gameEngine.app.username + " create is failed! code=" + gameEngine.app.serverErrs[retcode].name + "!");
            return;
        }

        gameEngine.Event.fire("onCreateAccountResult", retcode, datas);
        gameEngine.INFO_MSG("gameEngineApp::Client_onCreateAccountResult: " + gameEngine.app.username + " create is successfully!");
    }

    this.updatePlayerToServer = function () {
        var player = gameEngine.app.player();
        if (player == undefined || player.inWorld == false || gameEngine.app.spaceID == 0)
            return;

        if (gameEngine.app.entityLastLocalPos.distance(player.position) > 0.001 || gameEngine.app.entityLastLocalDir.distance(player.direction) > 0.001) {
            // 记录玩家最后一次上报位置时自身当前的位置
            gameEngine.app.entityLastLocalPos.x = player.position.x;
            gameEngine.app.entityLastLocalPos.y = player.position.y;
            gameEngine.app.entityLastLocalPos.z = player.position.z;
            gameEngine.app.entityLastLocalDir.x = player.direction.x;
            gameEngine.app.entityLastLocalDir.y = player.direction.y;
            gameEngine.app.entityLastLocalDir.z = player.direction.z;

            var bundle = new gameEngine.Bundle();
            bundle.newMessage(gameEngine.messages.Baseapp_onUpdateDataFromClient);
            bundle.writeFloat(player.position.x);
            bundle.writeFloat(player.position.y);
            bundle.writeFloat(player.position.z);
            bundle.writeFloat(player.direction.x);
            bundle.writeFloat(player.direction.y);
            bundle.writeFloat(player.direction.z);
            bundle.writeUint8(gameEngine.app.isOnGround);
            bundle.writeUint32(gameEngine.app.spaceID);
            bundle.send(gameEngine.app);
        }
    }

    this.addSpaceGeometryMapping = function (spaceID, respath) {
        gameEngine.INFO_MSG("gameEngineApp::addSpaceGeometryMapping: spaceID(" + spaceID + "), respath(" + respath + ")!");

        gameEngine.app.spaceID = spaceID;
        gameEngine.app.spaceResPath = respath;
        gameEngine.Event.fire("addSpaceGeometryMapping", respath);
    }

    this.clearSpace = function (isAll) {
        gameEngine.app.entityIDAliasIDList = [];
        gameEngine.app.spacedata = {};
        gameEngine.app.clearEntities(isAll);
        gameEngine.app.isLoadedGeometry = false;
        gameEngine.app.spaceID = 0;
    }

    this.clearEntities = function (isAll) {
        if (!isAll) {
            var entity = gameEngine.app.player();

            for (var eid in gameEngine.app.entities) {
                if (eid == entity.id)
                    continue;

                if (gameEngine.app.entities[eid].inWorld) {
                    gameEngine.app.entities[eid].leaveWorld();
                }

                gameEngine.app.entities[eid].onDestroy();
            }

            gameEngine.app.entities = {}
            gameEngine.app.entities[entity.id] = entity;
        }
        else {
            for (var eid in gameEngine.app.entities) {
                if (gameEngine.app.entities[eid].inWorld) {
                    gameEngine.app.entities[eid].leaveWorld();
                }

                gameEngine.app.entities[eid].onDestroy();
            }

            gameEngine.app.entities = {}
        }
    }

    this.Client_initSpaceData = function (stream) {
        gameEngine.app.clearSpace(false);

        gameEngine.app.spaceID = stream.readInt32();
        while (stream.length() > 0) {
            var key = stream.readString();
            var value = stream.readString();
            gameEngine.app.Client_setSpaceData(gameEngine.app.spaceID, key, value);
        }

        gameEngine.INFO_MSG("gameEngineApp::Client_initSpaceData: spaceID(" + gameEngine.app.spaceID + "), datas(" + gameEngine.app.spacedata + ")!");
    }

    this.Client_setSpaceData = function (spaceID, key, value) {
        gameEngine.INFO_MSG("gameEngineApp::Client_setSpaceData: spaceID(" + spaceID + "), key(" + key + "), value(" + value + ")!");

        gameEngine.app.spacedata[key] = value;

        if (key == "_mapping")
            gameEngine.app.addSpaceGeometryMapping(spaceID, value);

        gameEngine.Event.fire("onSetSpaceData", spaceID, key, value);
    }

    this.Client_delSpaceData = function (spaceID, key) {
        gameEngine.INFO_MSG("gameEngineApp::Client_delSpaceData: spaceID(" + spaceID + "), key(" + key + ")!");

        delete gameEngine.app.spacedata[key];
        gameEngine.Event.fire("onDelSpaceData", spaceID, key);
    }

    this.Client_getSpaceData = function (spaceID, key) {
        return gameEngine.app.spacedata[key];
    }

    this.Client_onUpdateBasePos = function (stream) {
        gameEngine.app.entityServerPos.x = stream.readFloat();
        gameEngine.app.entityServerPos.y = stream.readFloat();
        gameEngine.app.entityServerPos.z = stream.readFloat();
    }

    this.Client_onUpdateBasePosXZ = function (stream) {
        gameEngine.app.entityServerPos.x = stream.readFloat();
        gameEngine.app.entityServerPos.z = stream.readFloat();
    }

    this.Client_onUpdateData = function (stream) {
        var eid = gameEngine.app.getAoiEntityIDFromStream(stream);
        var entity = gameEngine.app.entities[eid];
        if (entity == undefined) {
            gameEngine.ERROR_MSG("gameEngineApp::Client_onUpdateData: entity(" + eid + ") not found!");
            return;
        }
    }

    this.Client_onSetEntityPosAndDir = function (stream) {
        var eid = stream.readInt32();
        var entity = gameEngine.app.entities[eid];
        if (entity == undefined) {
            gameEngine.ERROR_MSG("gameEngineApp::Client_onSetEntityPosAndDir: entity(" + eid + ") not found!");
            return;
        }

        entity.position.x = stream.readFloat();
        entity.position.y = stream.readFloat();
        entity.position.z = stream.readFloat();
        entity.direction.x = stream.readFloat();
        entity.direction.y = stream.readFloat();
        entity.direction.z = stream.readFloat();

        // 记录玩家最后一次上报位置时自身当前的位置
        gameEngine.app.entityLastLocalPos.x = entity.position.x;
        gameEngine.app.entityLastLocalPos.y = entity.position.y;
        gameEngine.app.entityLastLocalPos.z = entity.position.z;
        gameEngine.app.entityLastLocalDir.x = entity.direction.x;
        gameEngine.app.entityLastLocalDir.y = entity.direction.y;
        gameEngine.app.entityLastLocalDir.z = entity.direction.z;

        entity.set_direction(entity.direction);
        entity.set_position(entity.position);
    }

    this.Client_onUpdateData_ypr = function (stream) {
        var eid = gameEngine.app.getAoiEntityIDFromStream(stream);

        var y = stream.readInt8();
        var p = stream.readInt8();
        var r = stream.readInt8();

        gameEngine.app._updateVolatileData(eid, 0.0, 0.0, 0.0, y, p, r, -1);
    }

    this.Client_onUpdateData_yp = function (stream) {
        var eid = gameEngine.app.getAoiEntityIDFromStream(stream);

        var y = stream.readInt8();
        var p = stream.readInt8();

        gameEngine.app._updateVolatileData(eid, 0.0, 0.0, 0.0, y, p, gameEngine.KBE_FLT_MAX, -1);
    }

    this.Client_onUpdateData_yr = function (stream) {
        var eid = gameEngine.app.getAoiEntityIDFromStream(stream);

        var y = stream.readInt8();
        var r = stream.readInt8();

        gameEngine.app._updateVolatileData(eid, 0.0, 0.0, 0.0, y, gameEngine.KBE_FLT_MAX, r, -1);
    }

    this.Client_onUpdateData_pr = function (stream) {
        var eid = gameEngine.app.getAoiEntityIDFromStream(stream);

        var p = stream.readInt8();
        var r = stream.readInt8();

        gameEngine.app._updateVolatileData(eid, 0.0, 0.0, 0.0, gameEngine.KBE_FLT_MAX, p, r, -1);
    }

    this.Client_onUpdateData_y = function (stream) {
        var eid = gameEngine.app.getAoiEntityIDFromStream(stream);

        var y = stream.readPackY();

        gameEngine.app._updateVolatileData(eid, 0.0, 0.0, 0.0, y, gameEngine.KBE_FLT_MAX, gameEngine.KBE_FLT_MAX, -1);
    }

    this.Client_onUpdateData_p = function (stream) {
        var eid = gameEngine.app.getAoiEntityIDFromStream(stream);

        var p = stream.readInt8();

        gameEngine.app._updateVolatileData(eid, 0.0, 0.0, 0.0, gameEngine.KBE_FLT_MAX, p, gameEngine.KBE_FLT_MAX, -1);
    }

    this.Client_onUpdateData_r = function (stream) {
        var eid = gameEngine.app.getAoiEntityIDFromStream(stream);

        var r = stream.readInt8();

        gameEngine.app._updateVolatileData(eid, 0.0, 0.0, 0.0, gameEngine.KBE_FLT_MAX, gameEngine.KBE_FLT_MAX, r, -1);
    }

    this.Client_onUpdateData_xz = function (stream) {
        var eid = gameEngine.app.getAoiEntityIDFromStream(stream);

        var xz = stream.readPackXZ();

        gameEngine.app._updateVolatileData(eid, xz[0], 0.0, xz[1], gameEngine.KBE_FLT_MAX, gameEngine.KBE_FLT_MAX, gameEngine.KBE_FLT_MAX, 1);
    }

    this.Client_onUpdateData_xz_ypr = function (stream) {
        var eid = gameEngine.app.getAoiEntityIDFromStream(stream);

        var xz = stream.readPackXZ();

        var y = stream.readInt8();
        var p = stream.readInt8();
        var r = stream.readInt8();

        gameEngine.app._updateVolatileData(eid, xz[0], 0.0, xz[1], y, p, r, 1);
    }

    this.Client_onUpdateData_xz_yp = function (stream) {
        var eid = gameEngine.app.getAoiEntityIDFromStream(stream);

        var xz = stream.readPackXZ();

        var y = stream.readInt8();
        var p = stream.readInt8();

        gameEngine.app._updateVolatileData(eid, xz[0], 0.0, xz[1], y, p, gameEngine.KBE_FLT_MAX, 1);
    }

    this.Client_onUpdateData_xz_yr = function (stream) {
        var eid = gameEngine.app.getAoiEntityIDFromStream(stream);

        var xz = stream.readPackXZ();

        var y = stream.readInt8();
        var r = stream.readInt8();

        gameEngine.app._updateVolatileData(eid, xz[0], 0.0, xz[1], y, gameEngine.KBE_FLT_MAX, r, 1);
    }

    this.Client_onUpdateData_xz_pr = function (stream) {
        var eid = gameEngine.app.getAoiEntityIDFromStream(stream);

        var xz = stream.readPackXZ();

        var p = stream.readInt8();
        var r = stream.readInt8();

        gameEngine.app._updateVolatileData(eid, xz[0], 0.0, xz[1], gameEngine.KBE_FLT_MAX, p, r, 1);
    }

    this.Client_onUpdateData_xz_y = function (stream) {
        var eid = gameEngine.app.getAoiEntityIDFromStream(stream);

        var xz = stream.readPackXZ();

        var y = stream.readInt8();

        gameEngine.app._updateVolatileData(eid, xz[0], 0.0, xz[1], y, gameEngine.KBE_FLT_MAX, gameEngine.KBE_FLT_MAX, 1);
    }

    this.Client_onUpdateData_xz_p = function (stream) {
        var eid = gameEngine.app.getAoiEntityIDFromStream(stream);

        var xz = stream.readPackXZ();

        var p = stream.readInt8();

        gameEngine.app._updateVolatileData(eid, xz[0], 0.0, xz[1], gameEngine.KBE_FLT_MAX, p, gameEngine.KBE_FLT_MAX, 1);
    }

    this.Client_onUpdateData_xz_r = function (stream) {
        var eid = gameEngine.app.getAoiEntityIDFromStream(stream);

        var xz = stream.readPackXZ();

        var r = stream.readInt8();

        gameEngine.app._updateVolatileData(eid, xz[0], 0.0, xz[1], gameEngine.KBE_FLT_MAX, gameEngine.KBE_FLT_MAX, r, 1);
    }

    this.Client_onUpdateData_xyz = function (stream) {
        var eid = gameEngine.app.getAoiEntityIDFromStream(stream);

        var xz = stream.readPackXZ();
        var y = stream.readPackY();

        gameEngine.app._updateVolatileData(eid, xz[0], y, xz[1], gameEngine.KBE_FLT_MAX, gameEngine.KBE_FLT_MAX, gameEngine.KBE_FLT_MAX, 0);
    }

    this.Client_onUpdateData_xyz_ypr = function (stream) {
        var eid = gameEngine.app.getAoiEntityIDFromStream(stream);

        var xz = stream.readPackXZ();
        var y = stream.readPackY();

        var yaw = stream.readInt8();
        var p = stream.readInt8();
        var r = stream.readInt8();

        gameEngine.app._updateVolatileData(eid, xz[0], y, xz[1], yaw, p, r, 0);
    }

    this.Client_onUpdateData_xyz_yp = function (stream) {
        var eid = gameEngine.app.getAoiEntityIDFromStream(stream);

        var xz = stream.readPackXZ();
        var y = stream.readPackY();

        var yaw = stream.readInt8();
        var p = stream.readInt8();

        gameEngine.app._updateVolatileData(eid, xz[0], y, xz[1], yaw, p, gameEngine.KBE_FLT_MAX, 0);
    }

    this.Client_onUpdateData_xyz_yr = function (stream) {
        var eid = gameEngine.app.getAoiEntityIDFromStream(stream);

        var xz = stream.readPackXZ();
        var y = stream.readPackY();

        var yaw = stream.readInt8();
        var r = stream.readInt8();

        gameEngine.app._updateVolatileData(eid, xz[0], y, xz[1], yaw, gameEngine.KBE_FLT_MAX, r, 0);
    }

    this.Client_onUpdateData_xyz_pr = function (stream) {
        var eid = gameEngine.app.getAoiEntityIDFromStream(stream);

        var xz = stream.readPackXZ();
        var y = stream.readPackY();

        var p = stream.readInt8();
        var r = stream.readInt8();

        gameEngine.app._updateVolatileData(eid, x, y, z, gameEngine.KBE_FLT_MAX, p, r, 0);
    }

    this.Client_onUpdateData_xyz_y = function (stream) {
        var eid = gameEngine.app.getAoiEntityIDFromStream(stream);

        var xz = stream.readPackXZ();
        var y = stream.readPackY();

        var yaw = stream.readInt8();

        gameEngine.app._updateVolatileData(eid, xz[0], y, xz[1], yaw, gameEngine.KBE_FLT_MAX, gameEngine.KBE_FLT_MAX, 0);
    }

    this.Client_onUpdateData_xyz_p = function (stream) {
        var eid = gameEngine.app.getAoiEntityIDFromStream(stream);

        var xz = stream.readPackXZ();
        var y = stream.readPackY();

        var p = stream.readInt8();

        gameEngine.app._updateVolatileData(eid, xz[0], y, xz[1], gameEngine.KBE_FLT_MAX, p, gameEngine.KBE_FLT_MAX, 0);
    }

    this.Client_onUpdateData_xyz_r = function (stream) {
        var eid = gameEngine.app.getAoiEntityIDFromStream(stream);

        var xz = stream.readPackXZ();
        var y = stream.readPackY();

        var p = stream.readInt8();

        gameEngine.app._updateVolatileData(eid, xz[0], y, xz[1], r, gameEngine.KBE_FLT_MAX, gameEngine.KBE_FLT_MAX, 0);
    }

    this._updateVolatileData = function (entityID, x, y, z, yaw, pitch, roll, isOnGround) {
        var entity = gameEngine.app.entities[entityID];
        if (entity == undefined) {
            // 如果为0且客户端上一步是重登陆或者重连操作并且服务端entity在断线期间一直处于在线状态
            // 则可以忽略这个错误, 因为cellapp可能一直在向baseapp发送同步消息， 当客户端重连上时未等
            // 服务端初始化步骤开始则收到同步信息, 此时这里就会出错。			
            gameEngine.ERROR_MSG("gameEngineApp::_updateVolatileData: entity(" + entityID + ") not found!");
            return;
        }

        // 小于0不设置
        if (isOnGround >= 0) {
            entity.isOnGround = (isOnGround > 0);
        }

        var changeDirection = false;

        if (roll != gameEngine.KBE_FLT_MAX) {
            changeDirection = true;
            entity.direction.x = gameEngine.int82angle(roll, false);
        }

        if (pitch != gameEngine.KBE_FLT_MAX) {
            changeDirection = true;
            entity.direction.y = gameEngine.int82angle(pitch, false);
        }

        if (yaw != gameEngine.KBE_FLT_MAX) {
            changeDirection = true;
            entity.direction.z = gameEngine.int82angle(yaw, false);
        }

        var done = false;
        if (changeDirection == true) {
            gameEngine.Event.fire("set_direction", entity);
            done = true;
        }

        if (Math.abs(x + y + z) > 0.00001) {
            entity.position.x = x + gameEngine.app.entityServerPos.x;
            entity.position.y = y + gameEngine.app.entityServerPos.y;
            entity.position.z = z + gameEngine.app.entityServerPos.z;

            done = true;
            gameEngine.Event.fire("updatePosition", entity);
        }

        if (done)
            entity.onUpdateVolatileData();
    }

    this.Client_onStreamDataStarted = function (id, datasize, descr) {
    }

    this.Client_onStreamDataRecv = function (stream) {
    }

    this.Client_onStreamDataCompleted = function (id) {
    }

    this.Client_onReqAccountResetPasswordCB = function (failedcode) {
        if (failedcode != 0) {
            gameEngine.ERROR_MSG("gameEngineApp::Client_onReqAccountResetPasswordCB: " + gameEngine.app.username + " is failed! code=" + gameEngine.app.serverErrs[failedcode].name + "!");
            return;
        }

        gameEngine.INFO_MSG("gameEngineApp::Client_onReqAccountResetPasswordCB: " + gameEngine.app.username + " is successfully!");
    }

    this.Client_onReqAccountBindEmailCB = function (failedcode) {
        if (failedcode != 0) {
            gameEngine.ERROR_MSG("gameEngineApp::Client_onReqAccountBindEmailCB: " + gameEngine.app.username + " is failed! code=" + gameEngine.app.serverErrs[failedcode].name + "!");
            return;
        }

        gameEngine.INFO_MSG("gameEngineApp::Client_onReqAccountBindEmailCB: " + gameEngine.app.username + " is successfully!");
    }

    this.Client_onReqAccountNewPasswordCB = function (failedcode) {
        if (failedcode != 0) {
            gameEngine.ERROR_MSG("gameEngineApp::Client_onReqAccountNewPasswordCB: " + gameEngine.app.username + " is failed! code=" + gameEngine.app.serverErrs[failedcode].name + "!");
            return;
        }

        gameEngine.INFO_MSG("gameEngineApp::Client_onReqAccountNewPasswordCB: " + gameEngine.app.username + " is successfully!");
    }
}

gameEngine.create = function (gameEngineArgs) {
    if (gameEngine.app != undefined)
        return;

    new gameEngine.gameEngineApp(gameEngineArgs);

    gameEngine.app.reset();
    gameEngine.app.installEvents();
    gameEngine.idInterval = setInterval(gameEngine.app.update, gameEngineArgs.updateHZ);
}

gameEngine.destroy = function () {
    if (gameEngine.idInterval != undefined)
        clearInterval(gameEngine.idInterval);

    if (gameEngine.app == undefined)
        return;

    gameEngine.app.uninstallEvents();
    gameEngine.app.reset();
    gameEngine.app = undefined;
}

try {
        if(module != undefined)
        {
            module.exports = gameEngine;
        }
    }
catch (e) {

}

