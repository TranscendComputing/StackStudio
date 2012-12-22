require 'test_helper'

class EventsAndNewsControllerTest < ActionController::TestCase
  setup do
    @events_and_news = events_and_news(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:events_and_news)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create events_and_news" do
    assert_difference('EventsAndNews.count') do
      post :create, :events_and_news => @events_and_news.attributes
    end

    assert_redirected_to events_and_news_path(assigns(:events_and_news))
  end

  test "should show events_and_news" do
    get :show, :id => @events_and_news.to_param
    assert_response :success
  end

  test "should get edit" do
    get :edit, :id => @events_and_news.to_param
    assert_response :success
  end

  test "should update events_and_news" do
    put :update, :id => @events_and_news.to_param, :events_and_news => @events_and_news.attributes
    assert_redirected_to events_and_news_path(assigns(:events_and_news))
  end

  test "should destroy events_and_news" do
    assert_difference('EventsAndNews.count', -1) do
      delete :destroy, :id => @events_and_news.to_param
    end

    assert_redirected_to events_and_news_index_path
  end
end
