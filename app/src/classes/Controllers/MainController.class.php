<?php
/***************************************************************************
 *   Default Controller                                                    *
 *   @author Schon Dewid  2015                                             *
 ***************************************************************************/

class MainController implements Controller
{

    /**
     * @param HttpRequest $request
     * @return ModelAndView
     */
    public function handleRequest(HttpRequest $request)
    {
        return ModelAndView::create()
            ->setModel(Model::create())
            ->setView(RedirectView::create('/auth'));
    }
}