<?php
/**
 * Created by PhpStorm.
 * User: karachungen
 * Date: 6/22/14
 * Time: 9:44 PM
 */

namespace Shukay\DropzoneBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormView;
use Symfony\Component\Form\FormInterface;

class DropzoneType extends AbstractType
{

    private $folder;

    public function __construct($folder = "")
    {
        $this->folder = $folder;
    }

    public function getName()
    {
        return 'dropzone';
    }

    public function getParent()
    {
        return "text";
    }


    public function finishView(FormView $view, FormInterface $form, array $options)
    {
        parent::finishView($view, $form, $options);
        $view->vars['folder'] = $this->folder;
        // same for other fields
    }





} 