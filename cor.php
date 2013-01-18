<?php
    if($_SERVER['HTTP_ORIGIN'] == "https://www.stackplace.com”)
    {
      header('Access-Control-Allow-Origin: https://www.stackplace.com');
    }
?>