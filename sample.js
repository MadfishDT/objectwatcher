Object.defineProperty(Object.prototype,
  "watch", {
  enumerable: false,
  configurable: true,
  writable: false,
  value: function (propName, old, value) {
      this.onWatch(propName, old, value);
  }
});

Object.defineProperty(Object.prototype,
  "onWatch", {
  enumerable: false,
  configurable: true,
  writable: true,
  value: function (propName, old, value) {
  }
});

var testProxyValue = {
  name: 'first',
  value: '1'
}

const handler = {
  set(target, name, val) {
      target.watch(name, target[name], val);
      target[name] = val;
  }
};
testProxyValue = new Proxy(testProxyValue, handler);

testProxyValue.onWatch = (propName, oldv, newv) => {
  console.log('Proxy watcher called');
  console.log(`Mathod2: ${propName}  ${oldv} -> ${newv}`);
}

setInterval(() => {
  testProxyValue.name = `${Math.random()}`;
  testProxyValue.value = `${Math.random()}`;
  console.log(`************************************************`);
}, 2000);

