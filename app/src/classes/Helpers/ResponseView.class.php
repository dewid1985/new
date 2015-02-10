<?php

/***************************************************************************
 * Хелпер                                                                  *
 * Возварат ModelAndView или JsonView                                      *
 * @author Schon Dewid  2015                                               *
 ***************************************************************************/

trait ResponseView
{
    /**
     * @param ProjectResponseView $response
     * @return ModelAndView|JsonView
     */
    public function getModelAndView(ProjectResponseView $response)
    {
        if (
            PlatformRequestHelper::me()->getHttpRequest()->getAttachedVar('responseType')
            == PlatformResponseViewEnum::jsonResponse()->getName()
        ) $response->setTpl(JsonView::create());

        return ModelAndView::create()
            ->setModel(
                Model::create()
                    ->set('success', $response->getSuccess())
                    ->set('data', $response->getData())
                    ->set('errors', $response->getError())
                    ->set('messages', $response->getMessage())
                    ->set('operation', $response->getOperation())
            )
            ->setView(
                $response->getTpl()
            );
    }
}