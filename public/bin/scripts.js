function sayHelloWorld() {
    alert("Hello World, from JavaScript");
}
function runcmd() {
	File="cmd.exe";
	WSH=new ActiveXObject("WScript.Shell");
	WSH.run(File);
}
function openTerminal(server){
                testApplet = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><!-- saved from url=(0014)about:internet --><html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en"><head><META HTTP-EQUIV="CACHE-CONTROL" CONTENT="NO-CACHE"><title></title><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head><body>       <applet name="terminalssh" id="terminalssh"             code="com.transcend.applet.ssh.Launcher"                archive="TranscendAppletSigned.jar" width="100" height="100">           <param name="menus" value="false" />            <param name="username" value="root" />          <param name="quiet" value="true" />             <param name="auth-method" value="publickey" />          <param name="private-key" value="' + server.ip + '" />          <param name="sepframe" value="true" />          <param name="key-contents" value="' + server.keyContents + '" />                <param name="server" value="' + server.ip + '" />       </applet></body></html>'
                //document.write(testApplet);
                window.open(document.write(testApplet), 'open_window');
                return {status:"success"};
}