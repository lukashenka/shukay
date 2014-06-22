<?php
/**
 * Created by PhpStorm.
 * User: karachungen
 * Date: 6/22/14
 * Time: 9:44 PM
 */

namespace Shukay\StuffBundle\Form\Type;

use Symfony\Component\Form\AbstractType;

class DropzoneType extends AbstractType
{

    public function getName()
    {
        return 'dropzone';
    }

    public function getParent()
    {
        return "file";
    }
} 