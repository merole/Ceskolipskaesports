/**
 * 
 */

var util = require('util');
var events = require("events");
var net = require("net");
var jspack = require("./jspack.js").jspack;


exports.SERVERDATA_EXECCOMMAND = 2;
exports.SERVERDATA_AUTH = 3;

function RCon(host, port, callback){
	
	net.Socket.call(this);
	
	/**
	 * {String}
	 */
	this.host = host;
	/**
	 * {Number}
	 */
	this.port = port;

	/**
	 * {Number}
	 */
	this.id = 0;
	
	this.activeBuffer =  null;
	
	this.connect(this.port, this.host);
	
	if( callback )
		this.on('connect', callback);
	
	
	this.on('data', this._receiveMessage );
	this.on('error', this._receiveError );
	this.on('close', this._receiveError );
	
}

util.inherits(RCon, net.Socket);

RCon.prototype.auth = function( password, callback ){
	
	var returnId = this.command( exports.SERVERDATA_AUTH, password );
	var self = this;
	
	function receiveCallback(id){
		
		if(id == -1){
			callback.call(self, "Could not auth with the server");
		} else if( id == returnId){
			callback.call(self, null);
		}

	}
	
	if( callback )
		this.once('auth', receiveCallback);
	
};

RCon.prototype.send = function( cmd, callback ){
	
	var returnId = this.command( exports.SERVERDATA_EXECCOMMAND, cmd );
	
	if( callback ){
		/* How is this going to work:
		 * To avoid an infinite creation of hooks, once 10 messages in a row with a non-equal return id
		 * is returned, the callback will remove it self
		 */
		var count = 0;
		var self = this;
		
		function receiveMsg( id, type, str ){
			
			if( id == returnId ){
				callback.call(self, str);
				count = 0;
			}// else if( id > returnId ){
			//	self.removeListener('response', receiveMsg);				
			//}
			
		}
		
		self.on('response', receiveMsg);	

	}
	
};

RCon.prototype.command = function( cmd, message ){
	
	var id = this.id = (this.id + 1) % (1<<30);
	var i;
	
	if( !message )
		message = "";
	
	var pack = jspack.Pack('<II', [id, cmd]);
	
	for( i = 0; i < message.length; i++ )
		pack.push( message.charCodeAt(i) );
	
	pack.push(0);
	pack.push(0);
	
	pack = jspack.Pack('<I', [pack.length]).concat( pack );
	var buffer = new Buffer( pack );
	
	this.write( buffer );
	
	return id;
};

RCon.prototype._receiveMessage = function( data ){
	
	var dataLeft = 0;
	
	if( this.activeBuffer == null ){
		
		var size = jspack.Unpack("<l", data ); //The first 3 integers (size, request id, command response)
		var toWrite = Math.min(size[0], data.length);
		
		this.activeBuffer = new Buffer( size[0] );
		
		dataLeft = data.length - toWrite - 4;
		
		data.copy( this.activeBuffer, 0, 4, toWrite );
		
		this.activeBuffer.lastWrite = toWrite;
		
	} else {
		
		var toWrite = this.activeBuffer.length - this.activeBuffer.lastWrite - 1;
		dataLeft = data.length - toWrite - 5;
		
		data.copy( this.activeBuffer, this.activeBuffer.lastWrite, 0, toWrite );
		
		this.activeBuffer.lastWrite += toWrite + 1;
		
	}
	
	
	if( this.activeBuffer.lastWrite == this.activeBuffer.length ){
		
		var info = jspack.Unpack("<ll" + (this.activeBuffer.length-10) + "s", this.activeBuffer );
		
		var id = info[0];
		var response = info[1];
		var str = info[2]; 
		
		this.activeBuffer = null;
		
		this.emit('response', id, response, str );
		
		if( response == 2 ){
			this.emit('auth', id );
		}
		
	}
	
	if( dataLeft > 0 ){
		this._receiveMessage( data.slice( data.length - dataLeft ) );
	}
	
};

RCon.prototype._receiveError = function( data ){
	console.log("error:", data);
};

RCon.prototype._receiveClose = function( data ){
	console.log("close:", data);
};



exports.RCon = RCon;