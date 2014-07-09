<?php

namespace Shukay\UserBundle\Form;

use Shukay\DropzoneBundle\Form\Type\DropzoneType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class ProfileInformationType extends AbstractType
{

    private $avatarsFolder = "avatars";

    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */


    public function __construct($avatarsFolder = "")
    {
        $this->avatarsFolder = $avatarsFolder;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('avatar', new DropzoneType($this->avatarsFolder,"avatars"))
            ->add('firstName')
            ->add('lastName')
	        ->add('rate')
	        ->add('description')
            ->add('contacts')
            ->add('about');
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'Shukay\UserBundle\Entity\ProfileInformation'
        ));
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'shukay_userbundle_profileinformation';
    }
}
