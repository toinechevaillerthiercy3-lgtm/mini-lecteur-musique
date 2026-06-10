/*
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */

// Promises
var _libersign__promises = {};

var LiberSign = (function () {

    // Turn the incoming message from extension
    // into pending Promise resolving
    window.addEventListener("message", function (event) {
        if (event.source !== window) return;
        if (event.data.src && (event.data.src === "service_worker.js")) {
            // Get the promise
            var p = !!event.data.nonce ? _libersign__promises[event.data.nonce] : undefined;
            if (p !== undefined) {
                // resolve
                if (event.data.result === "ok") {
                    if (event.data.sign !== undefined) {
                        p.resolve(event.data.sign);
                    } else if (event.data.libersign !== undefined) {
                        p.resolve(event.data);
                    } else if (event.data.version !== undefined) {
                        p.resolve(event.data.extension + "/" + event.data.version);
                    } else if (event.data.certs !== undefined) {
                        p.resolve(event.data.certs);
                    } else if (event.data.hash !== undefined) {
                        p.resolve(event.data.hash);
                    } else if (event.data.updated !== undefined) {
                        p.resolve(event.data.updated);
                    } else {
                        console.error("No idea how to handle message... resolve it anyway", event.data);
                        p.resolve();
                    }
                } else {
                    // reject
                    p.reject(event.data);
                }
                delete _libersign__promises[event.data.nonce];
            } else {
                console.info("No nonce in event msg, it is a progress one ?");
                var messageEvent = new CustomEvent('libersignmessage', {
                    detail: event.data
                });
                window.dispatchEvent(messageEvent);
            }
        }
    }, false);

    var updateUrl,
    // To be exposed
        fields = {};

    function nonce() {
        var val = "";
        var hex = "abcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 16; i++) val += hex.charAt(Math.floor(Math.random() * hex.length));
        return val;
    }

    function messagePromise(msg) {
        return new Promise(function (resolve, reject) {
            // amend with necessary metadata
            msg['nonce'] = nonce();
            msg['src'] = 'page.js';
            // store promise callbacks
            _libersign__promises[msg.nonce] = {
                resolve: resolve,
                reject: reject
            };
            // and send message
            window.postMessage(msg, "*");
        });
    }

    fields.setUpdateUrl = function (url) {
        updateUrl = url;
    };

    fields.doError = function () {
        return messagePromise("Message pas JSON");
    };
    fields.echo = function () {
        var msg = {action: 'ECHO', message: 'Tu bluffes, Martoni'};
        return messagePromise(msg);
    };

    var currentLibIndex = 0;
    var updateLib = function (md5Files, success, errorCb) {
        var indexes = Object.keys(md5Files);
        console.info(md5Files);
        if(currentLibIndex < indexes.length) {
            var file = indexes[currentLibIndex];
            //For each file, verify md5 hash, and update it if needed
            var msg = {action: 'GETHASH', file: file};
            messagePromise(msg).then(function (gettedHash) {
                console.info(gettedHash);
                // Compare local md5 with server one
                if (gettedHash != md5Files[file]) {
                    var xhReq = new XMLHttpRequest();
                    xhReq.open("GET", updateUrl + 'update/' + file + '.b64?_=' + new Date().getTime(), true);
                    xhReq.onreadystatechange = function () {
                        if (xhReq.readyState != 4) {
                            return;
                        }
                        var base64file = xhReq.responseText;
                        // We got the base 64 signed file ! Now save it with native client...
                        var msg = {action: 'UPDATE', file: file, base64file: base64file};
                        messagePromise(msg).then(function () {
                            //Seems ok... object is fine
                            setTimeout(function() {
                                currentLibIndex++;
                                updateLib(md5Files, success, errorCb);
                            }, 1000);
                        }).catch(function (error) {
                            errorCb(error)
                        })
                    };
                    xhReq.send();
                } else {
                    currentLibIndex++;
                    updateLib(md5Files, success, errorCb);
                }
            }).catch(function (err) {
                errorCb(err);
            })
        } else {
            success();
        }
    };

    var checkForUpdates = function (success, errorCb) {
        // Check updates from server
        var xhReq = new XMLHttpRequest();
        xhReq.open("GET", updateUrl + 'update.json?_=' + new Date().getTime(), true);
        xhReq.onreadystatechange = onResponse;
        xhReq.send();

        function onResponse() {
            if (xhReq.readyState != 4) {
                return;
            }
            console.info(xhReq.responseText);
            var md5Files = JSON.parse(xhReq.responseText);
            updateLib(md5Files, success, errorCb);
        }
    };

    fields.getCertificates = function (options) {
        return new Promise(function (resolve, reject) {
            checkForUpdates(function() {
                var msg = {action: 'LISTCERTS'};
                messagePromise(msg).then(function (listCert) {
                    resolve(listCert);
                }).catch(function (error) {
                    reject(error);
                });
            }, function(error) {
                reject(error);
            });
        });
    };

    fields.sign = function (cert, sign) {
        // Hash is valid, now sign !
        var msg = {action: 'SIGN', cert: cert, sign: sign};
        return messagePromise(msg);
    };

    fields.getVersion = function () {
        return messagePromise({
            action: 'VERSION'
        });
    };

    fields.getFullVersion = function () {
        return messagePromise({
            action: 'FULLVERSION'
        });
    };

    return fields;
})();

var event = new Event('libersignready');
window.dispatchEvent(event);
