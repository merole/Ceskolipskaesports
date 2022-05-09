var vows = require('vows'), assert = require('assert'), rcon = require('../rcon.js');
var events = require('events');

var suite = vows.describe('server');

suite.addBatch({
	"A server" : {
		topic : function() {
			var promise = new (events.EventEmitter);
					
			this.rcon = new rcon.RCon('127.0.1.1', 27016, function(e) {
				if (e) {
					promise.emit('error', e);
				} else {
					promise.emit('success', this);
				}	
			});
			
			return promise;
		},

		'Should connect to server' : function(e, rcon) {
			assert.ok(e == null, "Error on connecting to server: " + toString(e));
		},
		
		'Receive auth packet':{ 
			topic: function(){
				this.rcon.auth('cheese', this.callback ); 
			},
			
			'And get the auth message': function(e){
				assert.ok(e == null, "Error auth: " + toString(e));
			},
			
			'Send a simple message': {
				topic: function(){
					
					var self = this;
					
					this.rcon.send('status', function(data){
						
						self.callback( null, data );
						
					} );
					
				},
				'got response' : function( msg ){
					assert.ok( msg != null );					
				}
			}
		}
		

	}

}).export(module);
