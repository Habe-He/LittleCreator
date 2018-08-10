var KKVS = KKVS || {};

/*-----------------------------------------------------------------------------------------
 JavaScript Inheritance
 -----------------------------------------------------------------------------------------*/
/* Simple JavaScript Inheritance
 * By Kent
 * MIT Licensed.
 */
var PLAYER_MSG_ID_REQ_COMPETITIVE_RANKING = 5; // 排位赛季信息
var PLAYER_MSG_ID_REQ_PLAYER_COMPETITIVE_RANKING = 16; //发送玩家排位积分信息


KKVS.Class = function () {};
KKVS.Class.extend = function (prop) {
    var _super = this.prototype;

    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = Object.create(_super);
    initializing = false;
    fnTest = /xyz/.test(function () {
        xyz;
    }) ? /\b_super\b/ : /.*/;

    // Copy the properties over onto the new prototype
    for (var name in prop) {
        // Check if we're overwriting an existing function
        prototype[name] = typeof prop[name] == "function" &&
            typeof _super[name] == "function" && fnTest.test(prop[name]) ?
            (function (name, fn) {
                return function () {
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
            })(name, prop[name]) :
            prop[name];
    }

    // The dummy class constructor
    function Class() {
        // All construction is actually done in the init method
        if (!initializing) {
            if (!this.ctor) {
                if (this.__nativeObj)
                    KKVS.INFO_MSG("No ctor function found!");
            } else {
                this.ctor.apply(this, arguments);
            }
        }
    }

    // Populate our constructed prototype object
    Class.prototype = prototype;

    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;

    return Class;
};

/*-----------------------------------------------------------------------------------------
 global
 -----------------------------------------------------------------------------------------*/
KKVS.PACKET_MAX_SIZE = 1500;
KKVS.PACKET_MAX_SIZE_TCP = 1460;
KKVS.PACKET_MAX_SIZE_UDP = 1472;

KKVS.MESSAGE_ID_LENGTH = 2;
KKVS.MESSAGE_LENGTH_LENGTH = 2;

KKVS.CLIENT_NO_FLOAT = 0;
KKVS.KBE_FLT_MAX = 3.402823466e+38;

/*-----------------------------------------------------------------------------------------
 number64bits
 -----------------------------------------------------------------------------------------*/
KKVS.INT64 = function (lo, hi) {
    this.lo = lo;
    this.hi = hi;

    this.sign = 1;

    if (hi >= 2147483648) {
        this.sign = -1;
        if (this.lo > 0) {
            this.lo = (4294967296 - this.lo) & 0xffffffff;
            this.hi = 4294967295 - this.hi;
        } else {
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

KKVS.UINT64 = function (lo, hi) {
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
KKVS.INFO_MSG = function (s) {
    cc.log("*****INFO***** " + s);
}

KKVS.DEBUG_MSG = function (s) {
    cc.log("*****DEBUG***** " + s);
}

KKVS.ERROR_MSG = function (s) {
    cc.log("*****ERROR***** " + s);
}

KKVS.WARNING_MSG = function (s) {
    cc.log("*****WARNING***** " + s);
}

/*-----------------------------------------------------------------------------------------
 string
 -----------------------------------------------------------------------------------------*/
KKVS.utf8ArrayToString = function (array) {
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

KKVS.stringToUTF8Bytes = function (str) {
    var utf8 = [];
    for (var i = 0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6),
                0x80 | (charcode & 0x3f));
        } else if (charcode < 0xd800 || charcode >= 0xe000) {
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
            charcode = 0x10000 + (((charcode & 0x3ff) << 10) |
                (str.charCodeAt(i) & 0x3ff))
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
KKVS.EventInfo = function (classinst, callbackfn) {
    this.callbackfn = callbackfn;
    this.classinst = classinst;
}

KKVS.Event = function () {
    this._events = {};

    this.register = function (evtName, classinst, strCallback) {
        //var callbackfn = eval("classinst." + strCallback);
        var callbackfn = classinst[strCallback];
        if (callbackfn == undefined) {
            KKVS.ERROR_MSG('KKVS.Event::fire: not found strCallback(' + classinst + ")!" + strCallback);
            return;
        }

        var evtlst = this._events[evtName];
        if (evtlst == undefined) {
            evtlst = [];
            this._events[evtName] = evtlst;
        }

        var info = new KKVS.EventInfo(classinst, callbackfn);
        evtlst.push(info);
    }

    this.deregister = function (evtName, classinst) {
        var evtlst = this._events[evtName];
        if (evtlst == undefined) {
            return;
        }
        for (var i = 0, len = evtlst.length; i < len; ++i) {
            var info = evtlst[i];
            if (info.classinst == classinst) {
                evtlst.splice(i, 1);
                break;
            }
        }
        //for (itemkey in this._events) {
        //    var evtlst = this._events[itemkey];
        //    while (true) {
        //        var found = false;
        //        for (var i = 0; i < evtlst.length; i++) {
        //            var info = evtlst[i];
        //            if (info.classinst == classinst) {
        //                evtlst.splice(i, 1);
        //                found = true;
        //                break;
        //            }
        //        }
        //
        //        if (!found)
        //            break;
        //    }
        //}
    }

    this.fire = function () {
        if (arguments.length < 1) {
            KKVS.ERROR_MSG('KKVS.Event::fire: not found eventName!');
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
            } else {
                info.callbackfn.apply(info.classinst, ars);
            }
        }
    }
}

KKVS.Event = new KKVS.Event();

/*-----------------------------------------------------------------------------------------
 memorystream
 -----------------------------------------------------------------------------------------*/
KKVS.MemoryStream = function (size_or_buffer) {
    if (size_or_buffer instanceof ArrayBuffer) {
        this.buffer = size_or_buffer;
    } else {
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
    KKVS.MemoryStream.PackFloatXType = function () {
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
        //return new KBEngine.INT64(this.readUint32(), this.readUint32());
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
        //return new KBEngine.UINT64(this.readUint32(), this.readUint32());
        var buffers = this.buffer.slice(this.rpos, this.rpos + 8);
        var byteBuffer = ByteBuffer.wrap(buffers, "utf8", ByteBuffer.LITTLE_ENDIAN);
        var ret = byteBuffer.readUint64();
        this.rpos += 8;
        return ret;
    }

    this.readFloat = function () {
        try {
            var buf = new Float32Array(this.buffer, this.rpos, 1);
        } catch (e) {
            var buf = new Float32Array(this.buffer.slice(this.rpos, this.rpos + 4));
        }

        this.rpos += 4;
        return buf[0];
    }

    this.readDouble = function () {
        try {
            var buf = new Float64Array(this.buffer, this.rpos, 1);
        } catch (e) {
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
            } else {
                i++;
                break;
            }

            i++;

            if (this.rpos + i >= this.buffer.byteLength)
                throw (new Error("KKVS.MemoryStream::readString: rpos(" + (this.rpos + i) + ")>=" +
                    this.buffer.byteLength + " overflow!"));
        }

        this.rpos += i;
        return s;
    }

    this.readBlob = function () {
        size = this.readUint32();
        var buf = new Uint8Array(this.buffer, this.rpos, size);
        this.rpos += size;
        return buf;
    }

    this.readStream = function () {
        var buf = new Uint8Array(this.buffer, this.rpos, this.buffer.byteLength - this.rpos);
        this.rpos = this.buffer.byteLength;
        return new KKVS.MemoryStream(buf);
    }

    this.readPackXZ = function () {
        var xPackData = new KKVS.MemoryStream.PackFloatXType();
        var zPackData = new KKVS.MemoryStream.PackFloatXType();

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
        for (i = 0; i < 4; i++)
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
        for (i = 0; i < 4; i++)
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
        } catch (e) {
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
        } catch (e) {
            var buf = new Float64Array(1);
            buf[0] = v;
            var buf1 = new Uint8Array(this.buffer);
            var buf2 = new Uint8Array(buf.buffer);
            buf1.set(buf2, this.wpos);
        }

        this.wpos += 8;
    }

    this.writeBlob = function (v) {
        size = v.length;
        if (size + 4 > this.space()) {
            KKVS.ERROR_MSG("memorystream::writeBlob: no free!");
            return;
        }

        this.writeUint32(size);
        var buf = new Uint8Array(this.buffer, this.wpos, size);

        if (typeof (v) == "string") {
            for (i = 0; i < size; i++) {
                buf[i] = v.charCodeAt(i);
            }
        } else {
            for (i = 0; i < size; i++) {
                buf[i] = v[i];
            }
        }

        this.wpos += size;
    }

    this.writeString = function (v) {
        if (v.length > this.space()) {
            KKVS.ERROR_MSG("memorystream::writeString: no free!");
            return;
        }

        var buf = new Uint8Array(this.buffer, this.wpos);
        var i = 0;
        for (idx = 0; idx < v.length; idx++) {
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
 entitydef
 -----------------------------------------------------------------------------------------*/
KKVS.moduledefs = {};
KKVS.datatypes = {};

KKVS.DATATYPE_UINT8 = function () {
    this.bind = function () {}

    this.createFromStream = function (stream) {
        return KKVS.reader.readUint8.call(stream);
    }

    this.addToStream = function (stream, v) {
        stream.writeUint8(v);
    }

    this.parseDefaultValStr = function (v) {
        return eval(v);
    }

    this.isSameType = function (v) {
        if (typeof (v) != "number") {
            return false;
        }

        if (v < 0 || v > 0xff) {
            return false;
        }

        return true;
    }
}

KKVS.DATATYPE_UINT16 = function () {
    this.bind = function () {}

    this.createFromStream = function (stream) {
        return KKVS.reader.readUint16.call(stream);
    }

    this.addToStream = function (stream, v) {
        stream.writeUint16(v);
    }

    this.parseDefaultValStr = function (v) {
        return eval(v);
    }

    this.isSameType = function (v) {
        if (typeof (v) != "number") {
            return false;
        }

        if (v < 0 || v > 0xffff) {
            return false;
        }

        return true;
    }
}

KKVS.DATATYPE_UINT32 = function () {
    this.bind = function () {}

    this.createFromStream = function (stream) {
        return KKVS.reader.readUint32.call(stream);
    }

    this.addToStream = function (stream, v) {
        stream.writeUint32(v);
    }

    this.parseDefaultValStr = function (v) {
        return eval(v);
    }

    this.isSameType = function (v) {
        if (typeof (v) != "number") {
            return false;
        }

        if (v < 0 || v > 0xffffffff) {
            return false;
        }

        return true;
    }
}

KKVS.DATATYPE_UINT64 = function () {
    this.bind = function () {}

    this.createFromStream = function (stream) {
        return KKVS.reader.readUint64.call(stream);
    }

    this.addToStream = function (stream, v) {
        stream.writeUint64(v);
    }

    this.parseDefaultValStr = function (v) {
        return eval(v);
    }

    this.isSameType = function (v) {
        return v instanceof KKVS.UINT64;
    }
}

KKVS.DATATYPE_INT8 = function () {
    this.bind = function () {}

    this.createFromStream = function (stream) {
        return KKVS.reader.readInt8.call(stream);
    }

    this.addToStream = function (stream, v) {
        stream.writeInt8(v);
    }

    this.parseDefaultValStr = function (v) {
        return eval(v);
    }

    this.isSameType = function (v) {
        if (typeof (v) != "number") {
            return false;
        }

        if (v < -0x80 || v > 0x7f) {
            return false;
        }

        return true;
    }
}

KKVS.DATATYPE_INT16 = function () {
    this.bind = function () {}

    this.createFromStream = function (stream) {
        return KKVS.reader.readInt16.call(stream);
    }

    this.addToStream = function (stream, v) {
        stream.writeInt16(v);
    }

    this.parseDefaultValStr = function (v) {
        return eval(v);
    }

    this.isSameType = function (v) {
        if (typeof (v) != "number") {
            return false;
        }

        if (v < -0x8000 || v > 0x7fff) {
            return false;
        }

        return true;
    }
}

KKVS.DATATYPE_INT32 = function () {
    this.bind = function () {}

    this.createFromStream = function (stream) {
        return KKVS.reader.readInt32.call(stream);
    }

    this.addToStream = function (stream, v) {
        stream.writeInt32(v);
    }

    this.parseDefaultValStr = function (v) {
        return eval(v);
    }

    this.isSameType = function (v) {
        if (typeof (v) != "number") {
            return false;
        }

        if (v < -0x80000000 || v > 0x7fffffff) {
            return false;
        }

        return true;
    }
}

KKVS.DATATYPE_INT64 = function () {
    this.bind = function () {}

    this.createFromStream = function (stream) {
        return KKVS.reader.readInt64.call(stream);
    }

    this.addToStream = function (stream, v) {
        stream.writeInt64(v);
    }

    this.parseDefaultValStr = function (v) {
        return eval(v);
    }

    this.isSameType = function (v) {
        return v instanceof KKVS.INT64;
    }
}

KKVS.DATATYPE_FLOAT = function () {
    this.bind = function () {}

    this.createFromStream = function (stream) {
        return KKVS.reader.readFloat.call(stream);
    }

    this.addToStream = function (stream, v) {
        stream.writeFloat(v);
    }

    this.parseDefaultValStr = function (v) {
        return eval(v);
    }

    this.isSameType = function (v) {
        return typeof (v) == "number";
    }
}

KKVS.DATATYPE_DOUBLE = function () {
    this.bind = function () {}

    this.createFromStream = function (stream) {
        return KKVS.reader.readDouble.call(stream);
    }

    this.addToStream = function (stream, v) {
        stream.writeDouble(v);
    }

    this.parseDefaultValStr = function (v) {
        return eval(v);
    }

    this.isSameType = function (v) {
        return typeof (v) == "number";
    }
}

KKVS.DATATYPE_STRING = function () {
    this.bind = function () {}

    this.createFromStream = function (stream) {
        return KKVS.reader.readString.call(stream);
    }

    this.addToStream = function (stream, v) {
        stream.writeString(v);
    }

    this.parseDefaultValStr = function (v) {
        return eval(v);
    }

    this.isSameType = function (v) {
        return typeof (v) == "string";
    }
}

KKVS.DATATYPE_VECTOR = function (size) {
    this.itemsize = size;

    this.bind = function () {}

    this.createFromStream = function (stream) {

        var size = KKVS.reader.readUint32.call(stream);
        if (size != this.itemsize) {
            KKVS.ERROR_MSG("KBEDATATYPE_VECTOR::createFromStream: size(" + size + ") != thisSize(" + this.itemsize + ") !");
            return undefined;
        }

        if (this.itemsize == 3) {
            if (KKVS.CLIENT_NO_FLOAT) {
                return new KKVS.Vector3(KKVS.reader.readInt32.call(stream),
                    KKVS.reader.readInt32.call(stream), KKVS.reader.readInt32.call(stream));
            } else {
                return new KKVS.Vector3(KKVS.reader.readFloat.call(stream),
                    KKVS.reader.readFloat.call(stream), KKVS.reader.readFloat.call(stream));
            }
        } else if (this.itemsize == 4) {
            if (KKVS.CLIENT_NO_FLOAT) {
                return new KKVS.Vector4(KKVS.reader.readInt32.call(stream),
                    KKVS.reader.readInt32.call(stream), KKVS.reader.readInt32.call(stream));
            } else {
                return new KKVS.Vector4(KKVS.reader.readFloat.call(stream),
                    KKVS.reader.readFloat.call(stream), KKVS.reader.readFloat.call(stream));
            }
        } else if (this.itemsize == 2) {
            if (KKVS.CLIENT_NO_FLOAT) {
                return new KKVS.Vector2(KKVS.reader.readInt32.call(stream),
                    KKVS.reader.readInt32.call(stream), KKVS.reader.readInt32.call(stream));
            } else {
                return new KKVS.Vector2(KKVS.reader.readFloat.call(stream),
                    KKVS.reader.readFloat.call(stream), KKVS.reader.readFloat.call(stream));
            }
        }

        return undefined;
    }

    this.addToStream = function (stream, v) {
        stream.writeUint32(this.itemsize);

        if (KKVS.CLIENT_NO_FLOAT) {
            stream.writeInt32(v.x);
            stream.writeInt32(v.y);
        } else {
            stream.writeFloat(v.x);
            stream.writeFloat(v.y);
        }

        if (this.itemsize == 3) {
            if (KKVS.CLIENT_NO_FLOAT) {
                stream.writeInt32(v.z);
            } else {
                stream.writeFloat(v.z);
            }
        } else if (this.itemsize == 4) {
            if (KKVS.CLIENT_NO_FLOAT) {
                stream.writeInt32(v.z);
                stream.writeInt32(v.w);
            } else {
                stream.writeFloat(v.z);
                stream.writeFloat(v.w);
            }
        }
    }

    this.parseDefaultValStr = function (v) {
        return eval(v);
    }

    this.isSameType = function (v) {
        if (this.itemsize == 2) {
            if (!v instanceof KKVS.Vector2) {
                return false;
            }
        } else if (this.itemsize == 3) {
            if (!v instanceof KKVS.Vector3) {
                return false;
            }
        } else if (this.itemsize == 4) {
            if (!v instanceof KKVS.Vector4) {
                return false;
            }
        }

        return true;
    }
}

KKVS.DATATYPE_PYTHON = function () {
    this.bind = function () {}

    this.createFromStream = function (stream) {}

    this.addToStream = function (stream, v) {}

    this.parseDefaultValStr = function (v) {
        return eval(v);
    }

    this.isSameType = function (v) {
        return false;
    }
}

KKVS.DATATYPE_UNICODE = function () {
    this.bind = function () {}

    this.createFromStream = function (stream) {
        return KKVS.utf8ArrayToString(KKVS.reader.readBlob.call(stream));
    }

    this.addToStream = function (stream, v) {
        stream.writeBlob(KKVS.stringToUTF8Bytes(v));
    }

    this.parseDefaultValStr = function (v) {
        if (typeof (v) == "string")
            return v;

        return "";
    }

    this.isSameType = function (v) {
        return typeof (v) == "string";
    }
}

KKVS.DATATYPE_MAILBOX = function () {
    this.bind = function () {}

    this.createFromStream = function (stream) {}

    this.addToStream = function (stream, v) {}

    this.parseDefaultValStr = function (v) {
        return eval(v);
    }

    this.isSameType = function (v) {
        return false;
    }
}

KKVS.DATATYPE_BLOB = function () {
    this.bind = function () {}

    this.createFromStream = function (stream) {
        var size = KKVS.reader.readUint32.call(stream);
        var buf = new Uint8Array(stream.buffer, stream.rpos, size);
        stream.rpos += size;
        return buf;
    }

    this.addToStream = function (stream, v) {
        stream.writeBlob(v);
    }

    this.parseDefaultValStr = function (v) {
        return eval(v);
    }

    this.isSameType = function (v) {
        return true;
    }
}

KKVS.DATATYPE_ARRAY = function () {
    this.type = KKVS.datatypes["UINT8"];

    this.bind = function () {
        if (typeof (this.type) == "object")
            this.type = KKVS.datatypes[this.type];
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
        return eval(v);
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

KKVS.DATATYPE_FIXED_DICT = function () {
    this.dicttype = {};
    this.implementedBy = null;

    this.bind = function () {
        for (itemkey in this.dicttype) {
            var utype = this.dicttype[itemkey];

            if (typeof (this.dicttype[itemkey]) == "number")
                this.dicttype[itemkey] = KKVS.datatypes[utype];
        }
    }

    this.createFromStream = function (stream) {
        var datas = {};
        for (itemkey in this.dicttype) {
            datas[itemkey] = this.dicttype[itemkey].createFromStream(stream);
        }

        return datas;
    }

    this.addToStream = function (stream, v) {
        for (itemkey in this.dicttype) {
            this.dicttype[itemkey].addToStream(stream, v[itemkey]);
        }
    }

    this.parseDefaultValStr = function (v) {
        return eval(v);
    }

    this.isSameType = function (v) {
        for (itemkey in this.dicttype) {
            if (!this.dicttype[itemkey].isSameType(v[itemkey])) {
                return false;
            }
        }

        return true;
    }
}

KKVS.datatypes["UINT8"] = new KKVS.DATATYPE_UINT8();
KKVS.datatypes["UINT16"] = new KKVS.DATATYPE_UINT16();
KKVS.datatypes["UINT32"] = new KKVS.DATATYPE_UINT32();
KKVS.datatypes["UINT64"] = new KKVS.DATATYPE_UINT64();

KKVS.datatypes["INT8"] = new KKVS.DATATYPE_INT8();
KKVS.datatypes["INT16"] = new KKVS.DATATYPE_INT16();
KKVS.datatypes["INT32"] = new KKVS.DATATYPE_INT32();
KKVS.datatypes["INT64"] = new KKVS.DATATYPE_INT64();

KKVS.datatypes["FLOAT"] = new KKVS.DATATYPE_FLOAT();
KKVS.datatypes["DOUBLE"] = new KKVS.DATATYPE_DOUBLE();

KKVS.datatypes["STRING"] = new KKVS.DATATYPE_STRING();
KKVS.datatypes["VECTOR2"] = new KKVS.DATATYPE_VECTOR(2);
KKVS.datatypes["VECTOR3"] = new KKVS.DATATYPE_VECTOR(3);
KKVS.datatypes["VECTOR4"] = new KKVS.DATATYPE_VECTOR(4);
KKVS.datatypes["PYTHON"] = new KKVS.DATATYPE_PYTHON();
KKVS.datatypes["UNICODE"] = new KKVS.DATATYPE_UNICODE();
KKVS.datatypes["MAILBOX"] = new KKVS.DATATYPE_MAILBOX();
KKVS.datatypes["BLOB"] = new KKVS.DATATYPE_BLOB();
KKVS.datatypes["ARRAY"] = new KKVS.DATATYPE_ARRAY();

//KKVS.GUID = 0;          //uint64
//KKVS.UID = 0;           //int32
//KKVS.UPWD = "";
//KKVS.myChairID = -1;    //uint16
//KKVS.KGOLD = 0;         //int64
//KKVS.KGOLD_BANK = 0;    //int64
//KKVS.NICKNAME = "";     //blob
//KKVS.EXP = 0;           //int32
//KKVS.VIP = 0;           //uint8
//KKVS.FACEID = 0;        //uint8
//KKVS.KBAO = 0;          //uint32
//KKVS.EnterLobbyID = 0;
//KKVS.RoomListInfo = {};
//KKVS.RoomPlayerCount = {};
//KKVS.SelectFieldID = 0;
//KKVS.EnterRoomID = -1;
//KKVS.EnterTableID = 65535;
//KKVS.EnterChairID = 65535;
//KKVS.GameID = 9070096;
//KKVS.CheckInData = null;
//KKVS.TurntableData = null;
//KKVS.BoxData = null;
//KKVS.MinScore = -1;
//KKVS.MaxScore = -1;
//KKVS.GameType = -1;
//KKVS.ROOM_TIMES = 1;
//KKVS.TipsLayer = null;
//KKVS.ServicePay = 0;
//KKVS.MailCount = 0;
//KKVS.FreeNum = 0;
//KKVS.FreePassWord = 0;
//
//KKVS.Acc = "";
//KKVS.Pwd = "";
//KKVS.Pwd_MD5 = "";
//KKVS.Login_type = "0";
//KKVS.MAC_ADDRESS = "";
//
//KKVS.HEAD_URL = "";
//KKVS.EXCHANGE_SIGN = "";
//
//KKVS.RankList = null;
//KKVS.UBMOB = "";    //bind mobile
//KKVS.PropList = null;
//
//KKVS.bShowHorn = false;
//KKVS.HornNotice = [];
//KKVS.bShowNotice = false;
//KKVS.SystemNotice = [];
//KKVS.GUIDE_FLAG = 0;
//KKVS.KBEngineID = 0;
//KKVS.GAME_ACC = "";
//KKVS.AdvertTag = true;
//KKVS.GENDER = 0;

KKVS.reset = function () {
    KKVS.GUID = 0; //uint64
    KKVS.UID = 0; //int32
    KKVS.UPWD = "";
    KKVS.myChairID = -1; //uint16
    KKVS.KGOLD = 0; //int64
    KKVS.KGOLD_BANK = 0; //int64
    KKVS.NICKNAME = ""; //blob
    KKVS.EXP = 0; //int32
    KKVS.VIP = 0; //uint8
    KKVS.FACEID = 0; //uint8
    KKVS.KBAO = 0; //uint32
    KKVS.EnterLobbyID = 0;
    KKVS.RoomListInfo = {};
    KKVS.RoomPlayerCount = {};
    KKVS.SelectFieldID = 0;
    KKVS.EnterRoomID = -1;
    KKVS.EnterTableID = 65535;
    KKVS.EnterChairID = 65535;
    KKVS.GameID = 9070096;
    KKVS.CheckInData = null;
    KKVS.LimitOpen = null;
    KKVS.WealthyOpen = null;
    KKVS.TurntableData = -1;
    KKVS.WealthyData = [];
    KKVS.BoxData = null;
    KKVS.MinScore = -1;
    KKVS.MaxScore = -1;
    KKVS.GameType = -1;
    KKVS.ROOM_TIMES = 1;
    KKVS.TipsLayer = null;
    KKVS.ServicePay = 0;
    KKVS.MailCount = 0;
    KKVS.FreeNum = 0;
    KKVS.FreePassWord = 0;

    KKVS.Acc = "";
    KKVS.Pwd = "";
    KKVS.Pwd_MD5 = "";
    KKVS.Login_type = "0";
    KKVS.MAC_ADDRESS = "";

    KKVS.HEAD_URL = "";
    KKVS.EXCHANGE_SIGN = "";

    KKVS.RankList = [];
    KKVS.OnRankList = [];
    KKVS.RedList = [];
    KKVS.UBMOB = ""; //bind mobile
    KKVS.PropList = null;

    KKVS.bShowHorn = false;
    KKVS.HornNotice = [];
    KKVS.bShowNotice = false;
    KKVS.SystemNotice = [];
    KKVS.GUIDE_FLAG = 0;
    KKVS.KBEngineID = 0;
    KKVS.GAME_ACC = "";
    KKVS.AdvertTag = true;
    KKVS.GENDER = 0;
    KKVS.ROOM_CARD = 0;
    KKVS.SCORE_MASTER = 0;
    KKVS.ALIPAY = "";
    KKVS.GAME_STATUS = 0;
    KKVS.UPBANKER_INFO = [];

    KKVS.MatchData = {}; //match data
    KKVS.CurMatchData = null; //current operate match data
    KKVS.ReRoomData = null; //reconnect room data
    KKVS.CurScene = 0; //current scene 0=login, 1=lobby
    KKVS.Kicked = false; //lobby socket kicked tag(true : only go to login scene)

    KKVS.RRECON_PAICOUNT = [];
    KKVS.ROOM_ID = 0;
    // 0：普通模式 - 金币场 - 随机
    // 6：排位
    // 2：房卡
    KKVS.GAME_MODEL = 0;

    // 房间号
    KKVS.COM_ROOM_NUMBER = 0;

    // 排位积分
    KKVS.PVPSCORES = 0;

    // 玩家头像框
    KKVS.HEAD_FRAME = 0;
    // 玩家段位信息
    KKVS.levelMsg = [];

    KKVS.RoomOutData = null; //jie shan fang jian shu ju
};

KKVS.reset();

module.exports = KKVS;