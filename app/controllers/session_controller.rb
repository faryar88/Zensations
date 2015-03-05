class SessionController < ApplicationController
  def new
  end

  def create
    user = User.find_by :email => params[:email]
    if user.present? && user.authenticate(params[:password])
      session[:user_id] = user.id
      if session[:destination].present?
        destination = session[:destination]
        session[:destination] = nil
        redirect_to destination
      else
        redirect_to(root_path)
        # render json: { status: "OK" }
      end
    else
      flash[:error] = "Invalid login or password"
      redirect_to(login_path)
      # render json: user.errors.messages
    end
  end

  def destroy
    session[:user_id] = nil
    redirect_to(root_path)
  end
end