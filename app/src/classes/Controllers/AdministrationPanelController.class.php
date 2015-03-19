<?php
/***************************************************************************
 *   Контроллер по умолчанию                                               *
 *   @author Schon Dewid  2015                                             *
 ***************************************************************************/

class AdministrationPanelController extends ProjectAuthMappedController
{
    /**
     * Индексовая страница приложения
     *
     * @param HttpRequest $request
     * @return ModelAndView
     */
    public function indexAction(HttpRequest $request)
    {
        return ModelAndView::create()
                    ->setModel(Model::create())
                    ->setView('index');
    }


    /**
     * Мапинг методов конроллера
     * Можно вернуть пустой массив если брать с учетом
     * что экшен будет тот который прописан в роут конфиге
     *
     * @return mixed
     */
    protected function /* array */
    getMapping()
    {
        return ARRAY(
            'index' => 'indexAction'
        );
    }
}