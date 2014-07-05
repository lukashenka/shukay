<?php

namespace Shukay\StuffBundle\Form;

use Shukay\DropzoneBundle\Form\Type\DropzoneType;
use Shukay\MapBundle\Form\LocationType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class StuffType extends AbstractType
{
    private $folder;

    public function __construct($folder = "")
    {
        $this->folder = $folder;
    }

    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('location', new LocationType())
            ->add('picture', new DropzoneType($this->folder))
            ->add('name')
            ->add('description');
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'Shukay\StuffBundle\Entity\Stuff'
        ));
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'stuff';
    }
}
