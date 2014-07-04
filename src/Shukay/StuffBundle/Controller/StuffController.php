<?php

namespace Shukay\StuffBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Shukay\StuffBundle\Entity\Stuff;
use Shukay\StuffBundle\Form\StuffType;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\File\Exception\AccessDeniedException;
use Symfony\Component\HttpFoundation\Request;

/**
 * Stuff controller.
 *
 * @Route("/stuff")
 */
class StuffController extends Controller
{

    /**
     * Lists all Stuff entities.
     *
     * @Route("/", name="stuff")
     * @Method("GET")
     * @Template()
     */
    public function listAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('ShukayStuffBundle:Stuff')->findAll();

        return array(
            'entities' => $entities,
        );
    }

    public function createAction(Request $request)
    {
        $user = $this->getUser();

	    if (!$this->get("security.context")->isGranted('IS_AUTHENTICATED_FULLY')) {

		    throw new AccessDeniedException("");
	    }

	    $stuff = new Stuff();
	    $stuff->setOwner($user);
	    $form = $this->createCreateForm($stuff);
	    $form->handleRequest($request);

        if ($form->isValid()) {
	        var_dump($stuff->getPicture());
	        $dropzone = $this->get("dropzone");
	        $dropzone->setFolder("stuff");
	        $dropzone->setUserName($this->get("security.context")->getToken()->getUsername());

	        $dropzone->saveImage($stuff->getPicture());

	        $em = $this->getDoctrine()->getManager();
	        $em->persist($stuff);
	        $em->flush();

	        return $this->redirect($this->generateUrl('stuff_show', array('id' => $stuff->getId())));
        }

        return $this->render("ShukayStuffBundle:Stuff:create.html.twig", array(
		        'entity' => $stuff,
		        'form' => $form->createView(),
            )
        );
    }

    /**
     * Creates a form to create a Stuff entity.
     *
     * @param Stuff $entity The entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createCreateForm(Stuff $entity)
    {
        $form = $this->createForm(new StuffType(), $entity, array(
            'action' => $this->generateUrl('stuff_create'),
            'method' => 'POST',
        ));

        $form->add('submit', 'submit', array('label' => 'Create'));

        return $form;
    }


    public function newAction()
    {
        $entity = new Stuff();
        $form = $this->createCreateForm($entity);

        return $this->render("ShukayStuffBundle:Stuff:create.html.twig",
            array(
                'entity' => $entity,
                'form' => $form->createView(),
            )
        );
    }

    public function showAction($id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('ShukayStuffBundle:Stuff')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Stuff entity.');
        }

        $deleteForm = $this->createDeleteForm($id);

        return $this->render("ShukayStuffBundle:Stuff:show.html.twig", array(
                'entity' => $entity,
                'delete_form' => $deleteForm->createView(),
            )
        );
    }

    /**
     * Displays a form to edit an existing Stuff entity.
     *
     * @Route("/{id}/edit", name="stuff_edit")
     * @Method("GET")
     * @Template()
     */
    public function editAction($id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('ShukayStuffBundle:Stuff')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Stuff entity.');
        }

        $editForm = $this->createEditForm($entity);
        $deleteForm = $this->createDeleteForm($id);

        return array(
            'entity' => $entity,
            'edit_form' => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        );
    }


    private function createEditForm(Stuff $entity)
    {
        $form = $this->createForm(new StuffType(), $entity, array(
            'action' => $this->generateUrl('stuff_update', array('id' => $entity->getId())),
            'method' => 'PUT',
        ));

        $form->add('submit', 'submit', array('label' => 'Update'));

        return $form;
    }

    public function updateAction(Request $request, $id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('ShukayStuffBundle:Stuff')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Stuff entity.');
        }

        $deleteForm = $this->createDeleteForm($id);
        $editForm = $this->createEditForm($entity);
        $editForm->handleRequest($request);

        if ($editForm->isValid()) {
            $em->flush();

            return $this->redirect($this->generateUrl('stuff_edit', array('id' => $id)));
        }

        return $this->render("ShukayStuffBundle:Stuff:edit.html.twig", array(
                'entity' => $entity,
                'edit_form' => $editForm->createView(),
                'delete_form' => $deleteForm->createView(),
            )
        );
    }


    public function deleteAction(Request $request, $id)
    {
        $form = $this->createDeleteForm($id);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $entity = $em->getRepository('ShukayStuffBundle:Stuff')->find($id);

            if (!$entity) {
                throw $this->createNotFoundException('Unable to find Stuff entity.');
            }

            $em->remove($entity);
            $em->flush();
        }

        return $this->redirect($this->generateUrl('stuff_list'));
    }

    /**
     * Creates a form to delete a Stuff entity by id.
     *
     * @param mixed $id The entity id
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createDeleteForm($id)
    {
        return $this->createFormBuilder()
            ->setAction($this->generateUrl('stuff_delete', array('id' => $id)))
            ->setMethod('DELETE')
            ->add('submit', 'submit', array('label' => 'Delete'))
            ->getForm();
    }
}
