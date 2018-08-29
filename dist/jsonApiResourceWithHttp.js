var jsonApiResource=function(t){function e(i){if(n[i])return n[i].exports;var r=n[i]={i:i,l:!1,exports:{}};return t[i].call(r.exports,r,r.exports,e),r.l=!0,r.exports}var n={};return e.m=t,e.c=n,e.d=function(t,n,i){e.o(t,n)||Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:i})},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=3)}([function(t,e){function n(t,e){for(var n in t)t.hasOwnProperty(n)&&e(t[n],n)}function i(t,e,n){return n.forEach(function(n){e.hasOwnProperty(n)&&(t[n]=e[n])}),t}function r(t){return t&&t.constructor===Array}function o(t,e){if(e)for(var n in e)e.hasOwnProperty(n)&&void 0!==e[n]&&(t[n]=e[n]);return t}function s(){return s.counter=s.counter||1,"c"+ ++s.counter}t.exports={assign:o,each:n,isArray:r,pick:i,clientId:s}},function(t,e,n){function i(t,e,n){var i=e.hasOwnProperty("constructor")?e.constructor:function(){t&&t.apply(this,arguments)};if(t){var o=function(){this.constructor=i};o.prototype=t.prototype,i.prototype=new o,r(i,t)}return n&&r(i,n),e&&r(i.prototype,e),i}var r=n(0).assign;t.exports=function(t,e){var n=i(null,t,e);return n.extend=function(t,e){return i(this,t,e)},n}},function(t,e,n){var i=n(1),r=n(0),o=r.isArray,s=r.clientId,a=i({constructor:function(t,e){this.cid=s(),this.syncWithData(t,e)},get:function(t){return"string"==typeof t?this.getProperty(t):this.normalize(t)},getProperty:function(t){return this.map(function(e){return e.get(t)})},getModel:function(t,e){var n=this.models.filter(function(n){var i=void 0!==t,r=!i||t===n.getProperty("id"),o=!e||e===n.getType();return!(!i&&!e)&&(r&&o)});return n.length?n[0]:void 0},where:function(t){return this.models.filter(function(e){var n=!0;for(var i in t)if(t.hasOwnProperty(i)&&!(n=t[i]===("type"===i?e.getType():e.getProperty(i))))break;return n})},findWhere:function(t){var e=this.where(t);return e.length?e[0]:void 0},add:function(t){var e=this;return(o(t)?t:[t]).forEach(function(t){e.has(t)||e.models.push(t)}),this.length=this.models.length,this},has:function(t){return Boolean(this.getModel(t.getProperty("id"),t.getType()))},remove:function(t){return this.models=this.models.filter(function(e){return e!==t}),this.length=this.models.length,this},syncWithData:function(t,e){var n=e&&e.Model||this.Model,i=a.prototype.Model,r=this;if(t)if("string"==typeof t&&(t=JSON.parse(t)),o(t))this.models=t;else{this.models=t.data.map(function(t){return new n({data:t},{assignIncludes:!1})});var s=(t.included||[]).map(function(t){return new i({data:t},{assignIncludes:!1})}),u=new a(this.models.concat(s));u.models.forEach(function(t){t.sourceCollection=r,t.includedCollection=u}),this.meta=t.meta||{}}return this.models=this.models||[],this.length=this.models.length,this.meta=this.meta||{},this},normalize:function(t){return this.map(function(e){return e.normalize(t)})}},{create:function(t,e){return new this(t,e)},getType:function(){return this.prototype.Model.getType()}});["forEach","map","filter","reduce","slice"].forEach(function(t){a.prototype[t]=function(){return this.models[t].apply(this.models,arguments)}}),t.exports=a},function(t,e,n){var i=n(4),r=n(2),o=n(5),s=n(6);r.prototype.Model=i,t.exports={Model:o(i),Collection:s(r)}},function(t,e,n){var i=n(1),r=n(2),o=n(0),s=o.assign,a=o.isArray,u=o.each,c=o.clientId,h=i({type:void 0,state:void 0,sourceCollection:void 0,includedCollection:void 0,constructor:function(t,e){this.cid=c(),this.syncWithData(t,e)},syncWithData:function(t,e){if(e=s({assignIncludes:!0},e),this.state={meta:{},data:{type:this.type||void 0,id:void 0,attributes:{},relationships:{}}},t&&(t="string"==typeof t?JSON.parse(t):t,s(this.state.data,t.data),s(this.state.meta,t.meta)),e.assignIncludes){var n=new r([this].concat((t&&t.included||[]).map(function(t){return new h({data:t},{assignIncludes:!1})})));n.forEach(function(t){t.includedCollection=n})}return this.state.data.type&&(this.type=this.state.data.type),this},getType:function(){return this.state.data.type},setType:function(t){return this.type=t,this.state.data.type=t,this},get:function(t){return"string"==typeof t?this.getProperty(t):this.normalize(t)},getProperty:function(t){var e,n="string"==typeof t?t.split("."):t,i=n[0];if(this.state.data.relationships[i]){if(void 0!==(e=this.getRelation(i))){if(2===n.length&&e instanceof r)return e.getProperty(n[1]);if(n.length>1)return n.shift(),e.getProperty(n)}}else e=this.getAttribute(i);return e},getAttribute:function(t){return"id"===t?this.state.data.id:this.state.data.attributes[t]},getRelation:function(t){var e=this.state.data.relationships[t],n=e&&e.data,i=this;return n?a(n)?new r(n.map(function(t){return i.includedCollection.getModel(t.id,t.type)})):i.includedCollection.getModel(n.id,n.type):void 0},getRelationshipReferences:function(t){var e=this.state.data.relationships[t];if(e){var n=e.data;return a(n)?n.length?n.map(function(t){return t.id}):void 0:n&&n.id?n.id:void 0}},normalize:function(t){var e={},n=this,i=function(t){throw new Error(t)};return t.forEach(function(t){var o,s,u;if("string"==typeof t?o=s=t:a(t)?(o=t[0],s=t[1]):i("Invalid schema structure"),"string"==typeof s)u=n.getProperty(s);else if("function"==typeof s)u=s(n);else if(a(s)){var c=n.getProperty(o);(c instanceof r||c instanceof h)&&(u=c.normalize(s))}else i("Invalid schema structure");(u instanceof h||u instanceof r)&&i("Data not properly normalized for key: "+o),e[o]=u}),e},setAttribute:function(t,e){var n=this.state.data.attributes;return 2===arguments.length?n[t]=e:s(n,t),this},setId:function(t){return this.state.data.id=t,this},setRelationship:function(t,e){var n=this,i=this.state.data.relationships,o={};return"string"==typeof t?o[t]=e:o=t,u(o,function(t,e){var o;t instanceof h?(o={type:t.getType(),id:t.getProperty("id")},n.includedCollection.add(t)):t instanceof r?(o=t.map(function(t){return{type:t.getType(),id:t.getProperty("id")}}),n.includedCollection.add(t.models)):o=t,i[e]={data:o}}),this},isNew:function(){return void 0===this.state.data.id}},{create:function(t,e){return new this(t,e)},createFromAttributes:function(t,e){return this.create({data:{attributes:t}},e)},getType:function(){return this.prototype.type}});t.exports=h},function(t,e,n){var i=n(0),r=i.assign,o=i.isArray,s=i.each,a=i.pick,u={url:function(){return this.constructor.url({type:this.getType(),id:this.get("id")})},saveAttribute:function(t,e){return 2===arguments.length&&this.setAttribute(t,e),this.save({attributes:[t]})},saveRelationship:function(t,e){return e&&this.setRelationship(t,e),this.save({relationships:[t]})},saveFile:function(t,e){var n={};return void 0!==e?n[t]=e:n=t,this.save({files:n})},save:function(t){var e=this,n=this.constructor,i={},u={method:this.isNew()?"POST":"PUT",url:this.url()};if(t=t||{attributes:Object.keys(this.state.data.attributes),relationships:Object.keys(this.state.data.relationships)},a(i,this.state.data,["type","id"]),t.attributes&&(o(t.attributes)||(this.setAttribute(t.attributes),t.attributes=Object.keys(t.attributes)),r(i,{attributes:a({},this.state.data.attributes,t.attributes)})),t.relationships&&(o(t.relationships)||(this.setRelationship(t.relationships),t.relationships=Object.keys(t.relationships)),r(i,{relationships:a({},this.state.data.relationships,t.relationships)})),t.files){var c=n.getFormDataType(),h=new c;h.append("data",JSON.stringify(i)),s(t.files,function(t,e){h.append(e,t)}),r(u,{method:"POST",data:h})}else r(u,{data:JSON.stringify({data:i})});return n.http(u).then(function(t){return e.syncWithData(t.data)})},fetch:function(t){var e=this;return this.constructor.http({method:"GET",url:t&&t.url||this.url()}).then(function(t){return e.syncWithData(t.data),e})},destroy:function(){var t=this;return this.constructor.http({method:"DELETE",url:this.url()}).then(function(e){return t.sourceCollection&&t.sourceCollection.remove(t),t.includedCollection&&t.includedCollection.remove(t),t})}},c={baseUrl:"/",url:function(t){var e=this;return t=r({type:e.prototype.type},t),e.appendQueryString([e.baseUrl,e.getTypeUrlSegment(t.type),t.id?"/"+t.id:""].join(""),t.query)},appendQueryString:function(t,e){var n=[],i="",r=function(t,e){s(t||{},function(t,i){var s=e?e+"["+i+"]":i;o(t)?n.push([s,t.join(",")]):t===Object(t)?r(t,s):n.push([s,t])})};return e===Object(e)?(r(e),i=n.filter(function(t){return void 0!==t[1]&&null!==t[1]&&t[1].toString().length>0}).map(function(t){return t.join("=")}).join("&")):"string"==typeof e&&(i=e),t+(i?"?"+i:"")},getTypeUrlSegment:function(t){return t},getFormDataType:function(){return FormData},getFromApi:function(t,e){var n=this;return n.http({method:"GET",url:t&&t.url?t.url:n.url("string"==typeof t?{id:t}:t)}).then(function(t){var i=new n(t.data);return e&&e(i),i})}};t.exports=function(t){return r(t.prototype,u),r(t,c),t}},function(t,e,n){var i=n(0),r=i.assign,o={url:function(t){return this.prototype.Model.url(t)},getFromApi:function(t,e){var n=this;return t=t||{},"string"==typeof t&&(t={type:t}),n.http({method:"GET",url:t.url||n.url(t),contentType:"application/vnd.api+json"}).then(function(i){var r=new n(i.data,t);return e&&e(r),r})}};t.exports=function(t){return r(t,o),t}}]);