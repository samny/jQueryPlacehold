<?php

error_reporting(-1);
$params = array();
if (count($_GET) > 0) {
    $params = $_GET;
} else {
    $params = $_POST;
}

if (!$params['w'] || $params['w'] =="" ) $params['w'] = 500;
if (!$params['h'] || $params['h'] =="" ) $params['h'] = 500;
if (!$params['c'] || $params['c'] =="" ) $params['c'] = 'dddddd';

$width = $params['w'];
$height = $params['h'];
$color = $params['c'];
$text =$width."x".$height;

$font = 'questrial.ttf';
$fontSize = $height;

$img = imagecreatetruecolor( $width, $height ) or die("Cannot Initialize new GD image stream");
$background_color = hexColorAlloc( $img, $color, 1);
imagefill($img, 0, 0, $background_color);

$x = -1;
while($x<10){
	$fontSize = $fontSize-1;
	$bbox = imagettfbbox($fontSize, 0, $font, $text);
	$x = $bbox[0] + (imagesx($img) / 2) - ($bbox[4] / 2);
	$y = $bbox[1] + (imagesy($img) / 2) - ($bbox[5] / 2);
}

$text_color =  hexColorAlloc( $img, $color, 0.9);
imagettftext($img, $fontSize, 0, $x, $y, $text_color, $font, $text);

header("Content-Type: image/png");
imagepng( $img );

function hexColorAlloc($im,$hex, $brightness){ 
	$a = hexdec(substr($hex,0,2)); 
	$b = hexdec(substr($hex,2,2)); 
	$c = hexdec(substr($hex,4,2)); 
	return imagecolorallocate($im, $a*$brightness, $b*$brightness, $c*$brightness); 
}  
?>