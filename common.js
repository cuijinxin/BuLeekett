function loadJS( url, callback ){
  let script = document.createElement('script'),
  fn = callback || function(){};
  script.type = 'text/javascript';
  script.onload = function(){
    fn();
  };
  script.src = url;
  document.getElementsByTagName('head')[0].appendChild(script);
}

export {
  loadJS
}